import { hasUser } from './../auth/helpers/hasUser';
import { UserService } from './user.service';
import {
  Controller,
  FileTypeValidator,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
import { of } from 'rxjs';

@Controller('v1/user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('upload')
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 0.7 }), // 0.7Mb
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
      SharpPipe,
    )
    imageFilename: string,
    @Req() req: Request,
  ) {
    if (hasUser(req)) {
      const userId = req.cookies.userId || 0;

      if (userId) {
        this.userService.uploadAvatar(userId, imageFilename);

        return {
          statusCode: 200,
          message: 'success',
        };
      }
    }
  }

  @Get('avatar/:imagename')
  async findProfileImage(
    @Param('imagename') imagename: string,
    @Res() res: Response,
  ) {
    const imagePath = await this.userService.getImagePath(imagename);

    Logger.debug(imagePath);
    return of(res.sendFile(imagePath));
  }
}
