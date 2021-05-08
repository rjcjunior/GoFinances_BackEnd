import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      const fileHash = crypto.randomBytes(5).toString('HEX');
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};