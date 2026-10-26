import { SessionService } from '../service/session.service';
import { LoginRateLimitService } from '../security/login-rate-limit.service';
import { SessionController } from '../web/rest/session.controller';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../service/auth.service';
import { UserModule } from '../module/user.module';
import { JwtStrategy } from '../security/passport.jwt.strategy';
import { UserJWTController } from '../web/rest/user.jwt.controller';
import { jwtSettings } from '../security/jwt-settings';
import { Authority } from '../domain/authority.entity';

import { PublicUserController } from '../web/rest/public.user.controller';
import { AccountController } from '../web/rest/account.controller';
import { MfaService } from '../security/mfa.service';
import { MfaController } from '../web/rest/mfa.controller';
import { AccountRecoveryService } from '../security/account-recovery.service';
import { AccountRecoveryController } from '../web/rest/account-recovery.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Authority]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSettings.secret,
      signOptions: { expiresIn: jwtSettings.expiresIn, issuer: jwtSettings.issuer, audience: jwtSettings.audience, algorithm: 'HS256' },
    }),
  ],
  controllers: [UserJWTController, PublicUserController, AccountController, SessionController, MfaController, AccountRecoveryController],
  providers: [AuthService, JwtStrategy, SessionService, LoginRateLimitService, MfaService, AccountRecoveryService],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
