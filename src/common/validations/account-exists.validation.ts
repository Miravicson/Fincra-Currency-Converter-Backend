import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '@/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class AccountExists implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}
  async validate(value: string): Promise<boolean> {
    const account = await this.prisma.account.findUnique({
      where: { id: value },
    });

    return !!account;
  }
  defaultMessage?(
    validationArguments?: ValidationArguments | undefined,
  ): string {
    return `There is no account matching ID: ${validationArguments?.value}`;
  }
}
