import { ConfigService } from '@nestjs/config';
import { JWT_COOKIE_NAMES } from './../../../config/index';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AccessTokenStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && JWT_COOKIE_NAMES.accessToken in req.cookies) {
      return req.cookies[JWT_COOKIE_NAMES.accessToken];
    }

    return null;
  }
}
