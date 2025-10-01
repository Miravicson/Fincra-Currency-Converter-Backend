import { SetMetadata } from '@nestjs/common';

export const CHECK_ABILITY = 'check_ability';

export const CheckAbility = (
  ...abilities: { action: string; subject: string; conditions?: any }[]
) => SetMetadata(CHECK_ABILITY, abilities);
