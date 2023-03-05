import { ConfigService } from '@nestjs/config';
import { JWT_COOKIE_NAMES } from './../../../config/index';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { TypePayload } from '../types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: TypePayload) {
    const refreshToken = req.cookies.refresh;

    return { ...payload, refreshToken };
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && JWT_COOKIE_NAMES.refreshToken in req.cookies) {
      return req.cookies[JWT_COOKIE_NAMES.refreshToken];
    }

    return null;
  }
}
