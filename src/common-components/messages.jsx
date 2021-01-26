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
    defaultMessage: 'Check Your Email',
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
});

export default messages;
