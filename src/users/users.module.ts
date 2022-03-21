import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersStrategy } from './users.strategy';
import { ConfigModule } from '@nestjs/config';
import { User } from './users.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '48h',
      },
    }),
  ],
  providers: [UsersService, UsersStrategy],
  controllers: [UsersController],
  exports: [UsersModule],
})
export class UsersModule {}
