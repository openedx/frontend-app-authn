import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'institution.login.page.sub.heading': {
    id: 'institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below',
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
  'logistration.sign.in': {
    id: 'logistration.sign.in',
    defaultMessage: 'Sign in',
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
    defaultMessage: '1 letter',
    description: 'password requirement to have 1 letter',
  },
  'one.number': {
    id: 'one.number',
    defaultMessage: '1 number',
    description: 'password requirement to have 1 number',
  },
  'eight.characters': {
    id: 'eight.characters',
    defaultMessage: '8 characters',
    description: 'password requirement to have a minimum of 8 characters',
  },
  'password.sr.only.helping.text': {
    id: 'password.sr.only.helping.text',
    defaultMessage: 'Password must contain at least 8 characters, at least one letter, and at least one number',
    description: 'Password helping text for the sr-only class',
  },
  // third party auth
  'tpa.alert.heading': {
    id: 'tpa.alert.heading',
    defaultMessage: 'Almost done!',
    description: 'Success alert heading after user has successfully signed in with social auth',
  },
  'login.third.party.auth.account.not.linked': {
    id: 'login.third.party.auth.account.not.linked',
    defaultMessage: 'You have successfully signed into {currentProvider}, but your {currentProvider} '
                    + 'account does not have a linked {platformName} account. To link your accounts, '
                    + 'sign in now using your {platformName} password.',
    description: 'Message that appears on login page if user has successfully authenticated with social '
                  + 'auth but no associated platform account exists',
  },
  'register.third.party.auth.account.not.linked': {
    id: 'register.third.party.auth.account.not.linked',
    defaultMessage: 'You\'ve successfully signed into {currentProvider}! We just need a little more information '
                    + 'before you start learning with {platformName}.',
    description: 'Message that appears on register page if user has successfully authenticated with TPA '
                  + 'but no associated platform account exists',
  },
});

export default messages;
