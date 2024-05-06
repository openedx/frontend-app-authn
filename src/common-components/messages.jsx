import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // institution login strings
  'institution.login.page.sub.heading': {
    id: 'institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below',
    description: 'Heading of the institutions list',
  },
  // logistration strings
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
  'enterprisetpa.login.button.text.public.account.creation.disabled': {
    id: 'enterprisetpa.login.button.text.public.account.creation.disabled',
    defaultMessage: 'Show me other ways to sign in',
    description: 'Button text for login when account creation is disabled',
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
  'registration.using.tpa.form.heading': {
    id: 'registration.using.tpa.form.heading',
    defaultMessage: 'Finish creating your account',
    description: 'Heading that appears above form when user is trying to create account using social auth',
  },
  supportTitle: {
    id: 'zendesk.supportTitle',
    description: 'Title for the support button',
    defaultMessage: 'edX Support',
  },
  selectTicketForm: {
    id: 'zendesk.selectTicketForm',
    description: 'Select ticket form',
    defaultMessage: 'Please choose your request type:',
  },
  'registration.other.options.heading': {
    id: 'registration.other.options.heading',
    defaultMessage: 'Or register with:',
    description: 'A message that appears above third party auth providers i.e saml, google, facebook etc',
  },
  'institution.login.button': {
    id: 'institution.login.button',
    defaultMessage: 'Institution/campus credentials',
    description: 'shows institutions list',
  },
  'login.other.options.heading': {
    id: 'login.other.options.heading',
    defaultMessage: 'Or sign in with:',
    description: 'Text that appears above other sign in options like social auth buttons',
  },
  'enterprise.login.btn.text': {
    id: 'enterprise.login.btn.text',
    defaultMessage: 'Company or school credentials',
    description: 'Company or school login link text.',
  },
});

export default messages;
