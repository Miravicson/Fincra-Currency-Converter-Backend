import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '@casl/ability';
import { AuthenticatedRequest } from '@/auth/types';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY } from './casl.decorator';
import { UserWithProfile } from '@/users/types';
import { Action, AppAbility, AppSubjects } from './types';
import { isNumberString } from 'class-validator';

interface RequiredPermission {
  action: Action;
  subject: AppSubjects;
  conditions?: Record<string, any>;
}

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: CaslAbilityFactory,
  ) {}

  logger = new Logger(this.constructor.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.get<RequiredPermission[]>(
        CHECK_ABILITY,
        context.getHandler(),
      ) || [];

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const ability: AppAbility | null = await this.abilityFactory.createForUser(
      user as UserWithProfile,
    );

    if (!ability) {
      return false;
    }

    try {
      const isAuthorized = requiredPermissions.some((permission) => {
        try {
          const subjectInstance = this.createSubjectInstance(
            permission.subject,
            permission.conditions,
            request,
          );
          ForbiddenError.from(ability).throwUnlessCan(
            permission.action,
            subjectInstance,
          );
          return true; // If permission is granted, return true
        } catch (_error) {
          return false;
        }
      });
      return isAuthorized;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Creates a subject instance that includes dynamic conditions (e.g., replaces ':hospitalId' with actual request values).
   */
  private createSubjectInstance(
    subject: AppSubjects,
    conditions: Record<string, any> | undefined,
    request: any,
  ) {
    if (!conditions) {
      return subject; // If no conditions, return the subject name
    }

    const evaluateConditionValue = (conditionValue: any, request: any) => {
      if (
        typeof conditionValue === 'string' &&
        conditionValue.startsWith(':')
      ) {
        const key = conditionValue.substring(1);
        const valueFromBody = request.body && request.body[key];
        const valueFromQuery = request.query && request.query[key];
        const valueFromParam = request.params && request.params[key];
        const paramValue = valueFromBody ?? valueFromQuery ?? valueFromParam;
        this.logger.debug(`Value from Body: ${valueFromBody}`);
        this.logger.debug(`Value from Query: ${valueFromQuery}`);
        this.logger.debug(`Value from Param: ${valueFromParam}`);
        return isNumberString(paramValue) ? parseInt(paramValue) : paramValue;
      } else {
        return conditionValue;
      }
    };

    const evaluatedConditions = Object.fromEntries(
      Object.entries(conditions).map(([key, value]) => [
        key,
        evaluateConditionValue(value, request),
      ]),
    );

    this.logger.log(
      `Evaluated conditions: ${JSON.stringify(evaluatedConditions)}`,
    );

    return {
      ...evaluatedConditions,
      __caslSubjectType__: subject,
    } as AppSubjects; // Ensure CASL recognizes the subject type
  }
}
