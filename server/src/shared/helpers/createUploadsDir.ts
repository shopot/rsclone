import {
  UPLOADED_FILES_DESTINATION,
  DEFAULT_AVATAR,
} from './../../config/index';
import * as fs from 'fs';
import { join } from 'path';

export const createUploadsDir = () => {
  if (!fs.existsSync(UPLOADED_FILES_DESTINATION)) {
    fs.mkdirSync(UPLOADED_FILES_DESTINATION, { recursive: true });
    fs.copyFileSync(
      join(__dirname, '../../../uploads/', DEFAULT_AVATAR),
      UPLOADED_FILES_DESTINATION + '/' + DEFAULT_AVATAR,
    );
  }
};
