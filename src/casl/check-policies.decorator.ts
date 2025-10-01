import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from './policy-handler';
import { SetMetadataKeyEnum } from '@/auth/types';

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(SetMetadataKeyEnum.CHECK_POLICIES, handlers);
