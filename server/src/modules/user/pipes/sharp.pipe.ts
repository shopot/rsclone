import { UPLOADED_FILES_DESTINATION } from '../../../config/index';
import { Injectable, PipeTransform } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'node:path';
import * as sharp from 'sharp';

const MAX_IMAGE_WIDTH = 60;

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}.webp`;

    await sharp(image.buffer)
      .resize(MAX_IMAGE_WIDTH)
      .webp({ effort: 3 })
      .toFile(path.resolve(UPLOADED_FILES_DESTINATION, filename));

    return filename;
  }
}
