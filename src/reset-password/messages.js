import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'reset.password.page.heading': {
    id: 'reset.password.page.heading',
    defaultMessage: 'Reset your password',
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
    defaultMessage: 'New password',
    description: 'New password field label for the reset password page.',
  },
  'reset.password.page.confirm.field.label': {
    id: 'forgot.password.page.confirm.field.label',
    defaultMessage: 'Confirm password',
    description: 'Confirm password field label for the reset password page.',
  },
  'reset.password.page.submit.button': {
    id: 'reset.password.page.submit.button',
    defaultMessage: 'Reset my password',
    description: 'Submit button text for the reset password page.',
  },
  'reset.password.request.success.header.message': {
    id: 'reset.password.request.success.header.message',
    defaultMessage: 'Password reset complete.',
    description: 'header message when reset is successful.',
  },
  'forgot.password.confirmation.sign.in.link': {
    id: 'forgot.password.confirmation.sign.in.link',
    defaultMessage: 'sign in',
    description: 'link text used in message to refer to sign in page',
  },
  'reset.password.request.forgot.password.text': {
    id: 'reset.password.request.forgot.password.text',
    defaultMessage: 'Forgot password',
    description: 'Forgot password text',
  },
  'reset.password.request.invalid.token.header': {
    id: 'reset.password.request.invalid.token.header',
    defaultMessage: 'Invalid password reset link',
    description: 'Invalid password reset link help text heading',
  },
  'reset.password.empty.new.password.field.error': {
    id: 'reset.password.empty.new.password.field.error',
    defaultMessage: 'Please enter your new password.',
    description: 'Error message that appears when user tries to submit form with empty New Password field',
  },
  'forgot.password.empty.new.password.error.heading': {
    id: 'forgot.password.empty.new.password.error.heading',
    defaultMessage: 'We couldn\'t reset your password.',
    description: 'Heading that appears above error message when user submits empty form.',
  },
  'reset.password.request.server.error': {
    id: 'reset.password.request.server.error',
    defaultMessage: 'Failed to reset password',
    description: 'Failed to reset password error message heading.',
  },
  'reset.password.token.validation.sever.error': {
    id: 'reset.password.token.validation.sever.error',
    defaultMessage: 'Token validation failure',
    description: 'Failed to validate reset password token error message.',
  },
});

export default messages;
