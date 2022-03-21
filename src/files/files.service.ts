import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { join } from 'path';
import { Repository } from 'typeorm';
import { File } from './files.entity';

const fileRoute = '/files/';
const imageRoute = '/img/';
@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async createFile(file: Express.Multer.File) {
    const dbFile = new File();
    dbFile.fileName = file.originalname;
    dbFile.size = file.size;
    dbFile.src = process.env.SERVER + fileRoute + file.filename;
    dbFile.type = 'file';
    const savedFile = await this.filesRepository.save(dbFile);
    console.log(savedFile);
    return savedFile;
  }

  async createImage(file: Express.Multer.File) {
    const dbFile = new File();
    dbFile.fileName = file.originalname;
    dbFile.size = file.size;
    dbFile.type = 'image';
    dbFile.src = process.env.SERVER + imageRoute + file.filename;
    const savedFile = await this.filesRepository.save(dbFile);
    console.log(savedFile);
    return savedFile;
  }
}
