import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
  signup(@Body() createUserDto: AuthDto) {
    return this.authService.signUp(createUserDto);
  }

  /**
   * Login method
   * @param {AuthDto} data
   * @returns
   */
  @Post('signin')
  async login(
    @Body() data: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authTokens = await this.authService.signIn(data);
    this.authService.storeTokenInCookie(res, authTokens);

    const user = await this.authService.getUserProfile(authTokens.userId);

    res.status(200).send({
      data: {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      message: 'ok',
    });
    return;
    // return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (hasUser(req)) {
      const userId = req.user['sub'] || 0;

      this.authService.logout(userId);

      // Delete auth cookie and refresh cookie
      res.clearCookie(JWT_COOKIE_NAMES.accessToken, {
        signed: true,
        httpOnly: true,
      });

      res.clearCookie(JWT_COOKIE_NAMES.refreshToken, {
        signed: true,
        httpOnly: true,
      });

      res.clearCookie('userId', {
        signed: true,
        httpOnly: true,
      });

      res.send({ message: 'success' }).end();
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

    this.authService.storeTokenInCookie(res, newAuthTokens);
    res.status(200).send({ message: 'ok' });
    return;
  }
}
