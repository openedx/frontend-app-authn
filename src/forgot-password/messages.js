import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
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
  'forgot.password.page.email.field.help.text': {
    id: 'forgot.password.page.email.field.help.text',
    defaultMessage: 'The email address you used to register with edX.',
    description: 'Email field help text for the forgot password page.',
  },
  'forgot.password.page.submit.button': {
    id: 'forgot.password.page.submit.button',
    defaultMessage: 'Recover my password',
    description: 'Submit button text for the forgot password page.',
  },
  'forgot.password.page.email.invalid.length.message': {
    id: 'forgot.password.page.email.invalid.length.message',
    defaultMessage: 'Email must have at least 3 characters.',
    description: 'Invalid email address length message for the forgot password page.',
  },
  'forgot.password.request.server.error': {
    id: 'forgot.password.request.server.error',
    defaultMessage: 'Failed to Send Forgot Password Email',
    description: 'Failed to Send Forgot Password Email help text heading.',
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
