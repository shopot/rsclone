import { ConfigService } from '@nestjs/config';
import { JWT_COOKIE_NAMES } from './../../config/index';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { TypeTokens } from './types';
import { Response, CookieOptions } from 'express';

const authCookieOptions: CookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const clearCookieOptions = {
  signed: true,
  ...authCookieOptions,
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signUp(dto: AuthDto): Promise<TypeTokens> {
    // Check if user exists
    const userExists = await this.usersService.findByUsername(dto.username);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(dto.password);
    const newUser = await this.usersService.create({ ...dto, hash });
    const tokens = await this.getTokens(newUser.id, newUser.username);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    return tokens;
  }

  async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.usersService.findByUsername(data.username);

    if (!user) {
      throw new BadRequestException('Incorrect username or password');
    }

    const passwordMatches = await argon2.verify(user.hash, data.password);

    if (!passwordMatches) {
      throw new BadRequestException('Incorrect username or password');
    }

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.usersService.update(userId, { refreshToken: 'undefined' });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: number, username: string): Promise<TypeTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      userId,
      accessToken,
      refreshToken,
    };
  }

  setAuthCookie(res: Response, authTokens: TypeTokens) {
    res
      .cookie('userId', authTokens.userId, authCookieOptions)
      .cookie(
        JWT_COOKIE_NAMES.accessToken,
        authTokens.accessToken,
        authCookieOptions,
      )
      .cookie(
        JWT_COOKIE_NAMES.refreshToken,
        authTokens.refreshToken,
        authCookieOptions,
      );
  }

  clearAuthCookie(res: Response) {
    // Delete auth cookie and refresh cookie
    res
      .clearCookie(JWT_COOKIE_NAMES.accessToken, clearCookieOptions)
      .clearCookie(JWT_COOKIE_NAMES.refreshToken, clearCookieOptions)
      .clearCookie('userId', clearCookieOptions);
  }

  async getUserProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    if (user) {
      return {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      };
    }

    throw new NotFoundException('User not found');
  }
}
