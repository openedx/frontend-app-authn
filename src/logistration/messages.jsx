import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'logistration.sign.in.button': {
    id: 'logistration.sign.in.button',
    defaultMessage: 'Sign in',
    description: 'Button label that appears on login page',
  },
  'logistration.create.account.button': {
    id: 'logistration.create.account.button',
    defaultMessage: 'Create Account',
    description: 'Button label that appears on register page',
  },
  'logistration.need.help.signing.in.collapsible.menu': {
    id: 'logistration.need.help.signing.in.collapsible.menu',
    defaultMessage: 'Need help signing in?',
    description: 'A button for collapsible need help signing in menu on login page',
  },
  'logistration.need.other.help.signing.in.collapsible.menu': {
    id: 'logistration.need.other.help.signing.in.collapsible.menu',
    defaultMessage: 'Need other help signing in?',
    description: 'A button for collapsible need other help signing in menu on forgot password page',
  },
  'logistration.register.link': {
    id: 'logistration.register.link',
    defaultMessage: 'Create an account',
    description: 'Register page link',
  },
  'logistration.forgot.password.link': {
    id: 'logistration.forgot.password.link',
    defaultMessage: 'Forgot my password',
    description: 'Forgot password link',
  },
  'logistration.already.have.an.edx.account': {
    id: 'logistration.already.have.an.edx.account',
    defaultMessage: 'Already have an edX account?',
    description: 'A message on registration page asking the user if he already has an edX account',
  },
  'logistration.sign.in.hyperlink': {
    id: 'logistration.sign.in.hyperlink',
    defaultMessage: ' Sign in.',
    description: 'Text for the hyperlink that takes user to login page',
  },
  'logistration.create.an.account.using': {
    id: 'logistration.create.an.account.using',
    defaultMessage: 'Create an account using',
    description: 'A message that appears before social auth buttons',
  },
  'logistration.create.a.new.one.here': {
    id: 'logistration.create.a.new.one.here',
    defaultMessage: 'or create a new one here',
    description: 'Text that appears after social auth buttons and before the registration form',
  },
  'logistration.other.sign.in.issues': {
    id: 'logistration.other.sign.in.issues',
    defaultMessage: 'Other sign-in issues',
    description: 'A link that redirects to sign-in issues help',
  },
  'logistration.login.institution.login.button': {
    id: 'logistration.login.institution.login.button',
    defaultMessage: 'Use my university info',
    description: 'shows institutions list',
  },
  'logistration.login.institution.login.page.title': {
    id: 'logistration.login.institution.login.page.title',
    defaultMessage: 'Sign in with Institution/Campus Credentials',
    description: 'Heading of institution page',
  },
  'logistration.institution.login.page.sub.heading': {
    id: 'logistration.institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below:',
    description: 'Heading of the institutions list',
  },
  'logistration.login.institution.login.page.back.button': {
    id: 'logistration.login.institution.login.page.back.button',
    defaultMessage: 'Back',
    description: 'return to login page',
  },
  'logistration.register.institution.login.button': {
    id: 'logistration.register.institution.login.button',
    defaultMessage: 'Use my institution/campus credentials',
    description: 'shows institutions list',
  },
  'logistration.register.institution.login.page.title': {
    id: 'logistration.register.institution.login.page.title',
    defaultMessage: 'Register with Institution/Campus Credentials',
    description: 'Heading of institution page',
  },
  'logistration.create.an.account': {
    id: 'logistration.create.an.account',
    defaultMessage: 'Create an Account',
    description: 'Message on button to return to register page',
  },
  'logistration.login.institution.login.sign.in': {
    id: 'logistration.login.institution.login.sign.in',
    defaultMessage: 'Sign In',
    description: 'Sign In text',
  },
  'logistration.or.sign.in.with': {
    id: 'logistration.or.sign.in.with',
    defaultMessage: 'or sign in with',
    description: 'gives hint about other sign in options',
  },
  'logistration.non.compliant.password.title': {
    id: 'logistration.non.compliant.password.title',
    defaultMessage: 'We recently changed our password requirements',
    description: 'A title that appears in bold before error message for non-compliant password',
  },
  'logistration.first.time.here': {
    id: 'logistration.first.time.here',
    defaultMessage: 'First time here?',
    description: 'A question that appears before sign up link',
  },
  'logistration.login.page.email.label': {
    id: 'logistration.login.page.email.label',
    defaultMessage: 'Email',
    description: 'Label that appears above email field',
  },
  'logistration.register.page.email.label': {
    id: 'logistration.register.page.email.label',
    defaultMessage: 'Email (required)',
    description: 'Label that appears above email field on register page',
  },
  'logistration.email.format.validation.message': {
    id: 'logistration.email.format.validation.message',
    defaultMessage: 'The email address you\'ve provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address format is incorrect',
  },
  'logistration.email.validation.message': {
    id: 'logistration.email.validation.message',
    defaultMessage: 'Please enter your Email.',
    description: 'Validation message that appears when email address is empty',
  },
  'logistration.email.help.message': {
    id: 'logistration.email.help.message',
    defaultMessage: 'The email address you used to register with edX.',
    description: 'Message that appears below email field on login page',
  },
  'logistration.password': {
    id: 'logistration.password',
    defaultMessage: 'Password',
    description: 'Text that appears above password field or as a placeholder',
  },
  'logistration.password.label': {
    id: 'logistration.password.label',
    defaultMessage: 'Password (required)',
    description: 'Label that appears above password field',
  },
  'logistration.login.page.password.validation.message': {
    id: 'logistration.login.page.password.validation.message',
    defaultMessage: 'Please enter your password.',
    description: 'Validation message that appears when password is empty',
  },
  'logistration.register.page.password.validation.message': {
    id: 'logistration.register.page.password.validation.message',
    defaultMessage: 'Please enter your Password.',
    description: 'Validation message that appears when password is non compliant with edX requirement',
  },
  'logistration.fullname.label': {
    id: 'logistration.fullname.label',
    defaultMessage: 'Full Name (required)',
    description: 'Label that appears above fullname field',
  },
  'logistration.fullname.validation.message': {
    id: 'logistration.fullname.validation.message',
    defaultMessage: 'Please enter your Full Name.',
    description: 'Validation message that appears when fullname is empty',
  },
  'logistration.username.label': {
    id: 'logistration.username.label',
    defaultMessage: 'Public Username (required)',
    description: 'Label that appears above username field',
  },
  'logistration.username.validation.message': {
    id: 'logistration.username.validation.message',
    defaultMessage: 'Please enter your Public Username.',
    description: 'Validation message that appears when username is invalid',
  },
  'logistration.country.validation.message': {
    id: 'logistration.country.validation.message',
    defaultMessage: 'Select your country or region of residence.',
    description: 'Validation message that appears when country is not selected',
  },
  'logistration.support.education.research': {
    id: 'logistration.support.education.research',
    defaultMessage: 'Support education research by providing additional information',
    description: 'Text for a checkbox to ask user for if they are willing to provide extra information for education research',
  },
  'logistration.register.optional.label': {
    id: 'logistration.register.optional.label',
    defaultMessage: '(optional)',
    description: 'Text that appears with optional field labels',
  },
  'logistration.enterprise.login.link.text': {
    id: 'logistration.enterprise.login.link.text',
    defaultMessage: 'Sign in with your company or school',
    description: 'Company or school login link text.',
  },
});

export default messages;
