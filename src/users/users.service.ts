import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';
import { JwtService } from '@nestjs/jwt';
import { FilesService } from 'src/files/files.service';

export interface UserDto {
  id: number;
  tag: string;
  name: string;
  phone: string;
  bio: string;
  password: string;
}

export interface RegistrationUserDto {
  tag: string;
  name: string;
  phone: string;
  bio: string;
  password: string;
  image: Express.Multer.File;
}

export interface AuthDto {
  tag: string;
  password: string;
}

export interface myJWT {
  id: number;
  tag: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private filesService: FilesService,
  ) {}

  //Функция для регистрации польтзователя в базе
  async registration(dto: RegistrationUserDto) {
    //Проверка на существование пользователя с тегом, указанным при регистрации
    const candidate = await this.usersRepository.findOne({
      tag: dto.tag,
    });
    if (candidate) {
      throw new ConflictException('User already exists');
    }
    const hashPassword = await bcrypt.hash(dto.password, 3);
    const image = await this.filesService.createImage(dto.image);
    try {
      const user = await this.usersRepository.insert({
        tag: dto.tag,
        name: dto.name,
        phone: dto.phone,
        bio: dto.bio,
        password: hashPassword,
        image,
      });


      //Структура jwt токена
      const userPayload: myJWT = {
        id: user.generatedMaps[0].id, //Ид пользователя, полученый после создания в БД
        tag: dto.tag,
        password: hashPassword,
      };
      const token = this.jwtService.sign(userPayload);
      return token;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  //Авторизация.
  async login(dto: AuthDto) {
    const user = await this.usersRepository.findOne({ tag: dto.tag });
    if (!user) {
      throw new BadRequestException(
        'Пользователь с введенным логином не найден.',
      );
    }
    const isValidPassword = await bcrypt.compare(
      dto.password,
      String(user.password),
    );
    if (!isValidPassword) {
      throw new BadRequestException('Неверный пароль.');
    }

    const userPayload: myJWT = {
      id: user.id,
      tag: dto.tag,
      password: user.password,
    };
    const token = this.jwtService.sign(userPayload);
    return token;
  }

  async getUser(userId: number) {
    return await this.usersRepository.findOne({ id: userId });
  }

  async getUserFromAuthenticationToken(token: string) {
    const payload: myJWT = this.jwtService.verify(token, {
      secret: process.env.SECRET,
    });
    if (payload.id) {
      return await this.getUser(payload.id);
    }
  }
}
