import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'sign.in': {
    id: 'sign.in',
    defaultMessage: 'Sign in',
    description: 'Sign in toggle text',
  },
  'reset.password.page.title': {
    id: 'reset.password.page.title',
    defaultMessage: 'Reset Password | {siteName}',
    description: 'page title',
  },
  'reset.password': {
    id: 'reset.password',
    defaultMessage: 'Reset password',
    description: 'The page heading and button text for reset password page.',
  },
  'reset.password.page.instructions': {
    id: 'reset.password.page.instructions',
    defaultMessage: 'Enter and confirm your new password.',
    description: 'Instructions message for reset password page.',
  },
  'new.password.label': {
    id: 'new.password.label',
    defaultMessage: 'New password',
    description: 'New password field label for the reset password page.',
  },
  'confirm.password.label': {
    id: 'confirm.password.label',
    defaultMessage: 'Confirm password',
    description: 'Confirm password field label for the reset password page.',
  },
  // validation errors
  'password.validation.message': {
    id: 'password.validation.message',
    defaultMessage: 'Password criteria has not been met',
    description: 'Error message for empty or invalid password',
  },
  'passwords.do.not.match': {
    id: 'passwords.do.not.match',
    defaultMessage: 'Passwords do not match',
    description: 'Password format error.',
  },
  'confirm.your.password': {
    id: 'confirm.your.password',
    defaultMessage: 'Confirm your password',
    description: 'Field validation message when confirm password is empty',
  },
  // alert banner strings
  'reset.password.failure.heading': {
    id: 'reset.password.failure.heading',
    defaultMessage: 'We couldn\'t reset your password.',
    description: 'Heading for reset password request failure',
  },
  'reset.password.form.submission.error': {
    id: 'reset.password.form.submission.error',
    defaultMessage: 'Please check your responses and try again.',
    description: 'Error message for reset password page',
  },
  'reset.server.rate.limit.error': {
    id: 'reset.server.rate.limit.error',
    defaultMessage: 'Too many requests.',
    description: 'Too many request at server end point',
  },
  'reset.password.success.heading': {
    id: 'reset.password.success.heading',
    defaultMessage: 'Password reset complete.',
    description: 'Heading for alert box when reset password is successful',
  },
  'reset.password.success': {
    id: 'reset.password.success',
    defaultMessage: 'Your password has been reset. Sign in to your account.',
    description: 'Reset password success message',
  },
  'internal.server.error': {
    id: 'internal.server.error',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'Error message that appears when server responds with 500 error code',
  },
  'rate.limit.error': {
    id: 'rate.limit.error',
    defaultMessage: 'An error has occurred because of too many requests. Please try again after some time.',
    description: 'Error message that appears when server responds with 429 error code',
  },
});

export default messages;
