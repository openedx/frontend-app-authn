import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'logistration.reset.password.page.heading': {
    id: 'logistration.reset.password.page.heading',
    defaultMessage: 'Reset Your Password',
    description: 'The page heading for the Reset password page.',
  },
  'logistration.reset.password.page.instructions': {
    id: 'logistration.reset.password.page.instructions',
    defaultMessage: 'Enter and confirm your new password.',
    description: 'Instructions message for reset password page.',
  },
  'logistration.reset.password.page.invalid.password.message': {
    id: 'logistration.reset.password.page.invalid.password.message',
    defaultMessage: 'This password is too short. It must contain at least 8 characters. This password must contain at least 1 number',
    description: 'Password format error.',
  },
  'logistration.reset.password.page.invalid.match.message': {
    id: 'logistration.reset.password.page.invalid.match.message',
    defaultMessage: 'Passwords do not match.',
    description: 'Password format error.',
  },
  'logistration.reset.password.page.new.field.label': {
    id: 'logistration.forgot.password.page.new.field.label',
    defaultMessage: 'New Password',
    description: 'New password field label for the reset password page.',
  },
  'logistration.reset.password.page.confirm.field.label': {
    id: 'logistration.forgot.password.page.confirm.field.label',
    defaultMessage: 'Confirm Password',
    description: 'Confirm password field label for the reset password page.',
  },
  'logistration.reset.password.page.submit.button': {
    id: 'logistration.reset.password.page.submit.button',
    defaultMessage: 'Reset my password',
    description: 'Submit button text for the reset password page.',
  },
});

export default messages;
