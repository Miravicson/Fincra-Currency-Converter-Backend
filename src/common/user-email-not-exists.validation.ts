import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '@/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class UserEmailNotExists implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}
  async validate(value: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: value },
    });

    return !user;
  }
  defaultMessage?(
    validationArguments?: ValidationArguments | undefined,
  ): string {
    return `A user with email: ${validationArguments?.value} does already exists`;
  }
}
