import { UPLOADED_FILES_DESTINATION } from './../../config/index';
import * as fs from 'fs';

export const createUploadsDir = () => {
  if (!fs.existsSync(UPLOADED_FILES_DESTINATION)) {
    fs.mkdirSync(UPLOADED_FILES_DESTINATION, { recursive: true });
  }
};
