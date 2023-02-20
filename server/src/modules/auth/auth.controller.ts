import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { TypePayload } from './types';

declare module 'express' {
  interface Request {
    user?: TypePayload;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: AuthDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    if (this.hasUser(req)) {
      const userId = req.user['sub'] || 0;
      this.authService.logout(userId);
    } else {
      throw new BadRequestException('Data is incorrect');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    if (this.hasUser(req)) {
      const userId = req.user['sub'] || 0;
      const refreshToken = req.user['refreshToken'] || '';
      return this.authService.refreshTokens(userId, refreshToken);
    } else {
      throw new BadRequestException('Data is incorrect');
    }
  }

  hasUser(req: Request): req is Request & { user: TypePayload } {
    return 'user' in req;
  }
}
