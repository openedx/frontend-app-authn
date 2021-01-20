import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'reset.password.page.heading': {
    id: 'reset.password.page.heading',
    defaultMessage: 'Reset Your Password',
    description: 'The page heading for the Reset password page.',
  },
  'reset.password.page.instructions': {
    id: 'reset.password.page.instructions',
    defaultMessage: 'Enter and confirm your new password.',
    description: 'Instructions message for reset password page.',
  },
  'reset.password.page.invalid.match.message': {
    id: 'reset.password.page.invalid.match.message',
    defaultMessage: 'Passwords do not match.',
    description: 'Password format error.',
  },
  'reset.password.page.new.field.label': {
    id: 'forgot.password.page.new.field.label',
    defaultMessage: 'New Password',
    description: 'New password field label for the reset password page.',
  },
  'reset.password.page.confirm.field.label': {
    id: 'forgot.password.page.confirm.field.label',
    defaultMessage: 'Confirm Password',
    description: 'Confirm password field label for the reset password page.',
  },
  'reset.password.page.submit.button': {
    id: 'reset.password.page.submit.button',
    defaultMessage: 'Reset my password',
    description: 'Submit button text for the reset password page.',
  },
});

export default messages;
