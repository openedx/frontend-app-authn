import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'forgot.password.page.title': {
    id: 'forgot.password.page.title',
    defaultMessage: 'Forgot Password | {siteName}',
    description: 'forgot password page title',
  },
  'forgot.password.page.heading': {
    id: 'forgot.password.page.heading',
    defaultMessage: 'Password assistance',
    description: 'The page heading for the forgot password page.',
  },
  'forgot.password.page.instructions': {
    id: 'forgot.password.page.instructions',
    defaultMessage: 'Please enter your log-in or recovery email address below and we will send you an email with instructions.',
    description: 'Instructions message for forgot password page.',
  },
  'forgot.password.page.invalid.email.message': {
    id: 'forgot.password.page.invalid.email.message',
    defaultMessage: "The email address you've provided isn't formatted correctly.",
    description: 'Invalid email address message for the forgot password page.',
  },
  'forgot.password.page.email.field.label': {
    id: 'forgot.password.page.email.field.label',
    defaultMessage: 'Email',
    description: 'Email field label for the forgot password page.',
  },
  'forgot.password.page.submit.button': {
    id: 'forgot.password.page.submit.button',
    defaultMessage: 'Recover my password',
    description: 'Submit button text for the forgot password page.',
  },
  'forgot.password.request.server.error': {
    id: 'forgot.password.request.server.error',
    defaultMessage: 'We couldn’t send the password recovery email.',
    description: 'Failed to send password recovery email.',
  },
  'forgot.password.error.message.title': {
    id: 'forgot.password.error.message.title',
    defaultMessage: 'An error occurred.',
    description: 'Title for message that appears when error occurs for password assistance page',
  },
  'forgot.password.request.in.progress.message': {
    id: 'forgot.password.request.in.progress.message',
    defaultMessage: 'Your previous request is in progress, please try again in a few moments.',
    description: 'Message displayed when previous password reset request is still in progress.',
  },
  'forgot.password.empty.email.field.error': {
    id: 'forgot.password.empty.email.field.error',
    defaultMessage: 'Please enter your email.',
    description: 'Error message that appears when user tries to submit empty email field',
  },
  'forgot.password.invalid.email.heading': {
    id: 'forgot.password.invalid.email',
    defaultMessage: 'An error occurred.',
    description: 'heading for invalid email',
  },
  'forgot.password.invalid.email.message': {
    id: 'forgot.password.invalid.email.message',
    defaultMessage: "The email address you've provided isn't formatted correctly.",
    description: 'message for invalid email',
  },
  'forgot.password.email.help.text': {
    id: 'forgot.password.email.help.text',
    defaultMessage: 'The email address you used to register with {platformName}',
    description: 'text help for the email',
  },
});
export default messages;
