import { SessionService } from './session.service';
import { LoginRateLimitService } from '../security/login-rate-limit.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, encodePassword } from '../security/password-util';
import { assertPassword } from '../security/password-policy';
import { UserLoginDTO } from '../service/dto/user-login.dto';
import { Payload } from '../security/payload.interface';
import { Authority } from '../domain/authority.entity';
import { UserService } from '../service/user.service';
import { UserDTO } from './dto/user.dto';
import { MfaService } from '../security/mfa.service';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessions: SessionService,
    private readonly loginLimit: LoginRateLimitService,
    @InjectRepository(Authority) private authorityRepository: Repository<Authority>,
    private userService: UserService,
    private readonly mfa: MfaService,
  ) {}

  async login(userLogin: UserLoginDTO): Promise<any> {
    const loginUserName = userLogin.username;
    const loginPassword = userLogin.password;
    if (
      typeof loginUserName !== 'string' ||
      !loginUserName ||
      loginUserName.length > 254 ||
      typeof loginPassword !== 'string' ||
      !loginPassword ||
      Buffer.byteLength(loginPassword, 'utf8') > 72
    ) {
      throw new HttpException('Username and password are required!', HttpStatus.BAD_REQUEST);
    }

    await this.loginLimit.consume(loginUserName);
    const userFind = await this.userService.findByFields({ where: { login: loginUserName } });
    const validPassword = !!userFind && (await comparePassword(loginPassword, userFind.password));
    if (!userFind || !validPassword) {
      throw new HttpException('Invalid login name or password!', HttpStatus.UNAUTHORIZED);
    }

    if (userFind && !userFind.activated) {
      throw new HttpException('Your account is not been activated!', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.findUserWithAuthById(userFind.id);

    const verified = await this.mfa.verifyLogin(user.id, userLogin.code);
    const session = await this.sessions.create(user.id, verified);
    const payload: Payload = { id: user.id, username: user.login, sid: session.id, mfa: verified };

    /* eslint-disable */
    return {
      id_token: this.jwtService.sign(payload),
      refresh_token: session.refreshToken,
    };
  }

  /* eslint-enable */
  async validateUser(payload: Payload): Promise<UserDTO | undefined> {
    const user = await this.findUserWithAuthById(payload.id);
    return user?.activated &&
      (await this.sessions.validate(payload.sid, user.id)) &&
      (!(await this.mfa.enabled(user.id)) || payload.mfa === true)
      ? Object.assign(user, { sessionId: payload.sid })
      : undefined;
  }

  async findUserWithAuthById(userId: number): Promise<UserDTO | undefined> {
    const userDTO: UserDTO = await this.userService.findByFields({ where: { id: userId } });
    return userDTO;
  }

  async refresh(token: string) {
    const session = await this.sessions.rotate(token);
    const user = await this.findUserWithAuthById(session.userId);
    if (!user?.activated || ((await this.mfa.enabled(session.userId)) && !session.mfaVerified)) {
      await this.sessions.revoke(session.id, session.userId);
      throw new HttpException('Session unavailable', HttpStatus.UNAUTHORIZED);
    }
    return {
      id_token: this.jwtService.sign({ id: user.id, username: user.login, sid: session.id, mfa: session.mfaVerified }),
      refresh_token: session.refreshToken,
    };
  }

  // Called only after a successful enrollment challenge, never from a public login body.
  async sessionAfterMfaEnrollment(userId: number) {
    const user = await this.findUserWithAuthById(userId);
    if (!user?.activated || !(await this.mfa.enabled(userId))) throw new HttpException('Session unavailable', HttpStatus.UNAUTHORIZED);
    const session = await this.sessions.create(userId, true);
    return {
      id_token: this.jwtService.sign({ id: userId, username: user.login, sid: session.id, mfa: true }),
      refresh_token: session.refreshToken,
    };
  }

  async getAccount(userId: number): Promise<UserDTO | undefined> {
    const userDTO: UserDTO = await this.findUserWithAuthById(userId);
    if (!userDTO) {
      return;
    }
    return userDTO;
  }

  async changePassword(userLogin: string, currentClearTextPassword: string, newPassword: string): Promise<void> {
    await this.loginLimit.consumeBucket(`password-change:${userLogin}`, 5);
    if (typeof currentClearTextPassword !== 'string' || Buffer.byteLength(currentClearTextPassword) > 72)
      throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
    const userFind: UserDTO = await this.userService.findByFields({ where: { login: userLogin } });
    if (!userFind) {
      throw new HttpException('Invalid login name!', HttpStatus.BAD_REQUEST);
    }

    if (!(await comparePassword(currentClearTextPassword, userFind.password))) {
      throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
    }
    userFind.password = newPassword;
    await this.userService.save(userFind, userLogin, true);
    await this.sessions.revokeAll(userFind.id);
  }

  async registerNewUser(newUser: UserDTO): Promise<UserDTO> {
    assertPassword(newUser.password, newUser.login);
    const encoded = await encodePassword(newUser.password);
    let userFind: UserDTO = await this.userService.findByFields({ where: { login: newUser.login } });
    if (userFind) {
      throw new HttpException('Login name already used!', HttpStatus.BAD_REQUEST);
    }
    userFind = await this.userService.findByFields({ where: { email: newUser.email } });
    if (userFind) {
      throw new HttpException('Email is already in use!', HttpStatus.BAD_REQUEST);
    }
    newUser.authorities = ['ROLE_USER'];
    const user: UserDTO = await this.userService.save({ ...newUser, password: encoded }, newUser.login, false);
    return user;
  }

  async updateUserSettings(userLogin: string, newUserInfo: UserDTO): Promise<UserDTO> {
    const userFind: UserDTO = await this.userService.findByFields({ where: { login: userLogin } });
    if (!userFind) {
      throw new HttpException('Invalid login name!', HttpStatus.BAD_REQUEST);
    }
    const userFindEmail: UserDTO = await this.userService.findByFields({ where: { email: newUserInfo.email } });
    if (userFindEmail && newUserInfo.email !== userFind.email) {
      throw new HttpException('Email is already in use!', HttpStatus.BAD_REQUEST);
    }

    userFind.firstName = newUserInfo.firstName;
    userFind.lastName = newUserInfo.lastName;
    userFind.email = newUserInfo.email;
    userFind.langKey = newUserInfo.langKey;
    await this.userService.save(userFind, userLogin);
    return userFind;
  }

  async getAllUsers(options: FindManyOptions<UserDTO>): Promise<[UserDTO[], number]> {
    return await this.userService.findAndCount(options);
  }
}
