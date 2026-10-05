import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtSettings } from './jwt-settings';
import { AuthService } from '../service/auth.service';
import { Payload } from './payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      issuer: jwtSettings.issuer,
      audience: jwtSettings.audience,
      secretOrKey: jwtSettings.secret,
    });
  }

  async validate(payload: Payload): Promise<any> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException('Session unavailable');
    }

    return user;
  }
}
