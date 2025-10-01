import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { hashPassWord } from '@utils/index';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@my-prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hash(createUserDto.password);

    createUserDto.password = hashedPassword;
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number, options: Prisma.UserDefaultArgs = {}) {
    return this.prisma.user.findUnique({ where: { id }, ...options });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassWord(updateUserDto.password);
    }
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async update2(
    filter: Prisma.UserUpdateArgs['where'],
    updateUserDto: Prisma.UserUpdateInput,
  ) {
    return await this.prisma.user.update({
      where: filter,
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
