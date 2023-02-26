import {
  DEFAULT_AVATAR,
  UPLOADED_FILES_DESTINATION,
} from './../../config/index';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './models/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto';
import { existsSync } from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user && user.avatar) {
      const baseUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:3000';

      return {
        ...user,
        avatar: `${baseUrl}/v1/user/avatar/${user.avatar}`,
      };
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username },
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = new User();

    user.username = dto.username;

    user.hash = dto.hash;

    const createdUser = await this.userRepository.save(user);

    // Disable hash
    createdUser.hash = '';

    return createdUser;
  }

  async update(userId: number, dto: UpdateUserDto) {
    this.userRepository.update(userId, { ...dto });
  }

  async uploadAvatar(userId: number, fileName: string) {
    this.update(userId, { avatar: fileName });
  }

  getImagePath(imagename: string) {
    const imagePath = path.resolve(UPLOADED_FILES_DESTINATION, imagename);

    if (existsSync(imagePath)) {
      return imagePath;
    }

    return path.resolve(UPLOADED_FILES_DESTINATION, DEFAULT_AVATAR);
  }
}
