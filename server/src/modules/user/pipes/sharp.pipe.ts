import { UPLOADED_FILES_DESTINATION } from '../../../config/index';
import { Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

const MAX_IMAGE_WIDTH = 60;

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    const originalName = path.parse(image.originalname).name;

    const filename = Date.now() + '-' + originalName + '.webp';

    await sharp(image.buffer)
      .resize(MAX_IMAGE_WIDTH)
      .webp({ effort: 3 })
      .toFile(`${UPLOADED_FILES_DESTINATION}/${filename}`);

    return filename;
  }
}
