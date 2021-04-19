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
  // Logistration strinsg
  'logistration.login': {
    id: 'logistration.login',
    defaultMessage: 'Login',
    description: 'Text that appears on the tab to switch between login and register',
  },
  'logistration.register': {
    id: 'logistration.register',
    defaultMessage: 'Register',
    description: 'Text that appears on the tab to switch between login and register',
  },
  'internal.server.error.message': {
    id: 'internal.server.error.message',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'Error message that appears when server responds with 500 error code',
  },
  'server.ratelimit.error.message': {
    id: 'server.ratelimit.error.message',
    defaultMessage: 'An error has occurred because of too many requests. Please try again after some time.',
    description: 'Error message that appears when server responds with 429 error code',
  },
  // enterprise sso strings
  'enterprisetpa.title.heading': {
    id: 'enterprisetpa.title.heading',
    defaultMessage: 'Would you like to sign in using your {providerName} credentials?',
    description: 'Header text used in enterprise third party authentication',
  },
  'enterprisetpa.sso.button.title': {
    id: 'enterprisetpa.sso.button.title',
    defaultMessage: 'Sign in using {providerName}',
    description: 'Text for third party auth provider buttons',
  },
  'enterprisetpa.login.button.text': {
    id: 'enterprisetpa.login.button.text',
    defaultMessage: 'Show me other ways to sign in or register',
    description: 'Button text for login',
  },
  // social auth providers
  'sso.sign.in.with': {
    id: 'sso.sign.in.with',
    defaultMessage: 'Sign in with {providerName}',
    description: 'Screen reader text that appears before social auth provider name',
  },
  'sso.create.account.using': {
    id: 'sso.create.account.using',
    defaultMessage: 'Create account using {providerName}',
    description: 'Screen reader text that appears before social auth provider name',
  },
  'start.learning': {
    id: 'start.learning',
    defaultMessage: 'Start Learning',
    description: 'Header text for logistration MFE pages',
  },
  'with.site.name': {
    id: 'with.site.name',
    defaultMessage: 'with {siteName}',
    description: 'Header text with site name for logistration MFE pages',
  },
  // password field strings
  'show.password': {
    id: 'show.password',
    defaultMessage: 'Show password',
    description: 'aria label for show password icon on password field',
  },
  'hide.password': {
    id: 'hide.password',
    defaultMessage: 'Hide password',
    description: 'aria label for hide password icon on password field',
  },
  'one.letter': {
    id: 'one.letter',
    defaultMessage: '1 Letter',
    description: 'password requirement to have 1 letter',
  },
  'one.number': {
    id: 'one.number',
    defaultMessage: '1 Number',
    description: 'password requirement to have 1 number',
  },
  'eight.characters': {
    id: 'eight.characters',
    defaultMessage: '8 Characters',
    description: 'password requirement to have a minimum of 8 characters',
  },
});

export default messages;
