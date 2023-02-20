import { hasUser } from './../auth/helpers/hasUser';
import { UserService } from './user.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from './pipes';
import { AccessTokenGuard } from '../auth/guards';
import { Request, Response } from 'express';

@Controller('/v1/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile(SharpPipe) image: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (hasUser(req)) {
      const userId = req.user['sub'] || 0;

      if (userId) {
        this.userService.uploadAvatar(userId, image.filename);
      }
    }
  }

  @Get(':imgpath')
  findProfileImage(@Param('imgpath') imgpath: string, @Res() res: Response) {
    const file = this.userService.imageBuffer(imgpath);
    res.contentType('image/*');
    res.send(file);
  }
}
