import { UPLOADED_FILES_DESTINATION } from '../../config/index';
import * as fs from 'fs';

export const checkUploadsDir = () => {
  if (fs.existsSync(UPLOADED_FILES_DESTINATION)) {
    fs.chmodSync(UPLOADED_FILES_DESTINATION, '0777');
  }
};
