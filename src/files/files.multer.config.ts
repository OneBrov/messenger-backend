import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const filesMulterConfig = {
  fileDest: join(__dirname, '..', '..', 'static', 'files'),
  imageDest: join(__dirname, '..', '..', 'static', 'img'),
};

// Multer upload options
export const multerOptions: MulterOptions = {
  limits: { fileSize: 100000000 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') return cb(null, true);
    if (file.fieldname === 'image') {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        // Allow storage of file
        cb(null, true);
      } else {
        // Reject file
        cb(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
    }
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath =
        file.fieldname === 'file'
          ? filesMulterConfig.fileDest
          : filesMulterConfig.imageDest;
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    // File modification details
    filename: (req, file, cb) => {
      const uuid = randomUUID();
      const extArray = file.mimetype.split('/');
      const extension = extArray[extArray.length - 1];
      const storeFileName = `${uuid}.${extension}`;
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${storeFileName}`);
    },
  }),
};
