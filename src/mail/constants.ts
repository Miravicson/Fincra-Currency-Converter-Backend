export enum MailJobNames {
  WELCOME_EMAIL = 'welcome-email',
  CONFIRM_EMAIL = 'confirm-email',
  RESET_PASSWORD = 'reset-password',
  RESET_PASSWORD_SUCCESS = 'reset-password-success',
  PASSWORD_CHANGE_SUCCESS = 'password-change-success',
  TEST_EMAIL = 'test-email',
}

export interface HasEmail {
  email: string;
}

export interface HasNames {
  firstName: string | null;
  lastName: string | null;
}
