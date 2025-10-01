import { Action, AppAbility } from './types';
interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const PolicyHandlers = {
  CAN_IMPERSONATE_USER: (ability) => ability.can(Action.Impersonate, 'User'),
} as const satisfies Record<string, PolicyHandler>;
