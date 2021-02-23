import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'institution.login.page.sub.heading': {
    id: 'institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below:',
    description: 'Heading of the institutions list',
  },
  // Confirmation Alert Message
  'forgot.password.confirmation.title': {
    id: 'forgot.password.confirmation.title',
    defaultMessage: 'Check your email',
    description: 'Forgot password confirmation message title',
  },
  'forgot.password.confirmation.support.link': {
    id: 'forgot.password.confirmation.support.link',
    defaultMessage: 'contact technical support',
    description: 'Technical support link text',
  },
  'forgot.password.confirmation.info': {
    id: 'forgot.password.confirmation.info',
    defaultMessage: 'If you do not receive a password reset message after 1 minute, verify that you entered the correct '
                    + 'email address, or check your spam folder.',
    description: 'Part of message that appears after user requests password change',
  },
  'internal.server.error.message': {
    id: 'internal.server.error.message',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'Error message that appears when server responds with 500 error code',
  },
  // enterprise sso strings
  'enterprisetpa.title.heading': {
    id: 'enterprisetpa.title.heading',
    defaultMessage: 'Would you like to sign in using your {providerName} credentials?',
    description: 'Header text used in enterprise third party authentication',
  },
  'enterprisetpa.login.button.text': {
    id: 'enterprisetpa.login.button.text',
    defaultMessage: 'Show me other ways to sign in or register',
    description: 'Button text for login',
  },
});

export default messages;
