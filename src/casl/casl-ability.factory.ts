import { AbilityBuilder } from '@casl/ability';
import { Role } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { createPrismaAbility } from '@casl/prisma';
import get from 'lodash/get';
import { AppAbility } from './types';
import { UserWithProfile } from '@/users/types';

@Injectable()
export class CaslAbilityFactory {
  constructor() {}

  interpolatePermissions(template: string, vars: object) {
    return JSON.parse(template, (_, rawValue) => {
      if (rawValue[0] !== '$') {
        return rawValue;
      }

      const name = rawValue.slice(2, -1);
      const value = get(vars, name);

      if (typeof value === 'undefined') {
        throw new ReferenceError(`Variable ${name} is not defined`);
      }

      return value;
    });
  }

  async createForUser(user: UserWithProfile) {
    if (!user.profile) {
      return null;
    }

    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user.role === Role.Admin) {
      can('read', 'all');
    }

    return build();
  }
}
