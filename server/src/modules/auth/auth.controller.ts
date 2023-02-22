import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWT_COOKIE_NAMES } from '../../config';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { hasUser } from './helpers';

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authTokens = await this.authService.signUp(dto);
    this.authService.setAuthCookie(res, authTokens);

    const data = await this.authService.getUserProfile(authTokens.userId);

    return { statusCode: 201, data, message: 'created' };
  }

  /**
   * Login method
   * @param {AuthDto} data
   * @returns
   */
  @Post('signin')
  @HttpCode(200)
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const authTokens = await this.authService.signIn(dto);
    this.authService.setAuthCookie(res, authTokens);

    const data = await this.authService.getUserProfile(authTokens.userId);

    return { statusCode: 200, data, message: 'ok' };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (hasUser(req)) {
      const userId = req.user['sub'] || 0;

      this.authService.logout(userId);
      this.authService.clearAuthCookie(res);

      return { statusCode: 200, message: 'success' };
    } else {
      throw new BadRequestException('Bad request');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[JWT_COOKIE_NAMES.refreshToken];
    const userId = req.cookies.userId || 0;

    const newAuthTokens = await this.authService.refreshTokens(
      userId,
      refreshToken,
    );

    this.authService.setAuthCookie(res, newAuthTokens);
    return { statusCode: 200, message: 'success' };
  }

  @UseGuards(AccessTokenGuard)
  @Get('whoami')
  async whoami(@Req() req: Request) {
    const userId = req.cookies.userId || 0;

    const data = await this.authService.getUserProfile(userId);

    return { statusCode: 200, data, message: 'ok' };
  }
}
