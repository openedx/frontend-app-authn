import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authn.reset.password.page.heading': {
    id: 'authn.reset.password.page.heading',
    defaultMessage: 'Reset Your Password',
    description: 'The page heading for the Reset password page.',
  },
  'authn.reset.password.page.instructions': {
    id: 'authn.reset.password.page.instructions',
    defaultMessage: 'Enter and confirm your new password.',
    description: 'Instructions message for reset password page.',
  },
  'authn.reset.password.page.invalid.match.message': {
    id: 'authn.reset.password.page.invalid.match.message',
    defaultMessage: 'Passwords do not match.',
    description: 'Password format error.',
  },
  'authn.reset.password.page.new.field.label': {
    id: 'authn.forgot.password.page.new.field.label',
    defaultMessage: 'New Password',
    description: 'New password field label for the reset password page.',
  },
  'authn.reset.password.page.confirm.field.label': {
    id: 'authn.forgot.password.page.confirm.field.label',
    defaultMessage: 'Confirm Password',
    description: 'Confirm password field label for the reset password page.',
  },
  'authn.reset.password.page.submit.button': {
    id: 'authn.reset.password.page.submit.button',
    defaultMessage: 'Reset my password',
    description: 'Submit button text for the reset password page.',
  },
});

export default messages;
