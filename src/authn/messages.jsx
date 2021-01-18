import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'authn.sign.in.button': {
    id: 'authn.sign.in.button',
    defaultMessage: 'Sign in',
    description: 'Button label that appears on login page',
  },
  'authn.create.account.button': {
    id: 'authn.create.account.button',
    defaultMessage: 'Create Account',
    description: 'Button label that appears on register page',
  },
  'authn.need.help.signing.in.collapsible.menu': {
    id: 'authn.need.help.signing.in.collapsible.menu',
    defaultMessage: 'Need help signing in?',
    description: 'A button for collapsible need help signing in menu on login page',
  },
  'authn.need.other.help.signing.in.collapsible.menu': {
    id: 'authn.need.other.help.signing.in.collapsible.menu',
    defaultMessage: 'Need other help signing in?',
    description: 'A button for collapsible need other help signing in menu on forgot password page',
  },
  'authn.register.link': {
    id: 'authn.register.link',
    defaultMessage: 'Create an account',
    description: 'Register page link',
  },
  'authn.forgot.password.link': {
    id: 'authn.forgot.password.link',
    defaultMessage: 'Forgot my password',
    description: 'Forgot password link',
  },
  'authn.already.have.an.edx.account': {
    id: 'authn.already.have.an.edx.account',
    defaultMessage: 'Already have an edX account?',
    description: 'A message on registration page asking the user if he already has an edX account',
  },
  'authn.sign.in.hyperlink': {
    id: 'authn.sign.in.hyperlink',
    defaultMessage: ' Sign in.',
    description: 'Text for the hyperlink that takes user to login page',
  },
  'authn.create.an.account.using': {
    id: 'authn.create.an.account.using',
    defaultMessage: 'Create an account using',
    description: 'A message that appears before social auth buttons',
  },
  'authn.create.a.new.one.here': {
    id: 'authn.create.a.new.one.here',
    defaultMessage: 'or create a new one here',
    description: 'Text that appears after social auth buttons and before the registration form',
  },
  'authn.other.sign.in.issues': {
    id: 'authn.other.sign.in.issues',
    defaultMessage: 'Other sign-in issues',
    description: 'A link that redirects to sign-in issues help',
  },
  'authn.login.institution.login.button': {
    id: 'authn.login.institution.login.button',
    defaultMessage: 'Use my university info',
    description: 'shows institutions list',
  },
  'authn.login.institution.login.page.title': {
    id: 'authn.login.institution.login.page.title',
    defaultMessage: 'Sign in with Institution/Campus Credentials',
    description: 'Heading of institution page',
  },
  'authn.institution.login.page.sub.heading': {
    id: 'authn.institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below:',
    description: 'Heading of the institutions list',
  },
  'authn.login.institution.login.page.back.button': {
    id: 'authn.login.institution.login.page.back.button',
    defaultMessage: 'Back to sign in',
    description: 'return to login page',
  },
  'authn.register.institution.login.button': {
    id: 'authn.register.institution.login.button',
    defaultMessage: 'Use my institution/campus credentials',
    description: 'shows institutions list',
  },
  'authn.register.institution.login.page.title': {
    id: 'authn.register.institution.login.page.title',
    defaultMessage: 'Register with Institution/Campus Credentials',
    description: 'Heading of institution page',
  },
  'authn.create.an.account': {
    id: 'authn.create.an.account',
    defaultMessage: 'Create an Account',
    description: 'Message on button to return to register page',
  },
  'authn.login.institution.login.sign.in': {
    id: 'authn.login.institution.login.sign.in',
    defaultMessage: 'Sign In',
    description: 'Sign In text',
  },
  'authn.or.sign.in.with': {
    id: 'authn.or.sign.in.with',
    defaultMessage: 'or sign in with',
    description: 'gives hint about other sign in options',
  },
  'authn.non.compliant.password.title': {
    id: 'authn.non.compliant.password.title',
    defaultMessage: 'We recently changed our password requirements',
    description: 'A title that appears in bold before error message for non-compliant password',
  },
  'authn.first.time.here': {
    id: 'authn.first.time.here',
    defaultMessage: 'First time here?',
    description: 'A question that appears before sign up link',
  },
  'authn.login.page.email.label': {
    id: 'authn.login.page.email.label',
    defaultMessage: 'Email',
    description: 'Label that appears above email field',
  },
  'authn.register.page.email.label': {
    id: 'authn.register.page.email.label',
    defaultMessage: 'Email (required)',
    description: 'Label that appears above email field on register page',
  },
  'authn.email.format.validation.message': {
    id: 'authn.email.format.validation.message',
    defaultMessage: 'The email address you\'ve provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address format is incorrect',
  },
  'authn.email.validation.message': {
    id: 'authn.email.validation.message',
    defaultMessage: 'Please enter your Email.',
    description: 'Validation message that appears when email address is empty',
  },
  'authn.email.ratelimit.less.chars.validation.message': {
    id: 'authn.email.ratelimit.less.chars.validation.message',
    defaultMessage: 'Email must have 3 characters.',
    description: 'Validation message that appears when email address is less than 3 characters',
  },
  'authn.email.ratelimit.incorrect.format.validation.message': {
    id: 'authn.email.ratelimit.incorrect.format.validation.message',
    defaultMessage: 'The email address you provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address is not formatted correctly with no backend validations available.',
  },
  'authn.email.ratelimit.password.validation.message': {
    id: 'authn.email.ratelimit.password.validation.message',
    defaultMessage: 'Your password must contain at least 8 characters',
    description: 'Validation message that appears when password is not formatted correctly with no backend validations available.',
  },
  'authn.email.help.message': {
    id: 'authn.email.help.message',
    defaultMessage: 'The email address you used to register with edX.',
    description: 'Message that appears below email field on login page',
  },
  'authn.password': {
    id: 'authn.password',
    defaultMessage: 'Password',
    description: 'Text that appears above password field or as a placeholder',
  },
  'authn.password.label': {
    id: 'authn.password.label',
    defaultMessage: 'Password (required)',
    description: 'Label that appears above password field',
  },
  'authn.login.page.password.validation.message': {
    id: 'authn.login.page.password.validation.message',
    defaultMessage: 'Please enter your password.',
    description: 'Validation message that appears when password is empty',
  },
  'authn.register.page.password.validation.message': {
    id: 'authn.register.page.password.validation.message',
    defaultMessage: 'Please enter your Password.',
    description: 'Validation message that appears when password is non compliant with edX requirement',
  },
  'authn.fullname.label': {
    id: 'authn.fullname.label',
    defaultMessage: 'Full Name (required)',
    description: 'Label that appears above fullname field',
  },
  'authn.fullname.validation.message': {
    id: 'authn.fullname.validation.message',
    defaultMessage: 'Please enter your Full Name.',
    description: 'Validation message that appears when fullname is empty',
  },
  'authn.username.label': {
    id: 'authn.username.label',
    defaultMessage: 'Public Username (required)',
    description: 'Label that appears above username field',
  },
  'authn.username.validation.message': {
    id: 'authn.username.validation.message',
    defaultMessage: 'Please enter your Public Username.',
    description: 'Validation message that appears when username is invalid',
  },
  'authn.username.ratelimit.less.chars.message': {
    id: 'authn.username.ratelimit.less.chars.message',
    defaultMessage: 'Public Username must have atleast 2 characters.',
    description: 'Validation message that appears when username is less than 2 characters and with no backend validations available.',
  },
  'authn.country.validation.message': {
    id: 'authn.country.validation.message',
    defaultMessage: 'Select your country or region of residence.',
    description: 'Validation message that appears when country is not selected',
  },
  'authn.support.education.research': {
    id: 'authn.support.education.research',
    defaultMessage: 'Support education research by providing additional information',
    description: 'Text for a checkbox to ask user for if they are willing to provide extra information for education research',
  },
  'authn.register.optional.label': {
    id: 'authn.register.optional.label',
    defaultMessage: '(optional)',
    description: 'Text that appears with optional field labels',
  },
  'authn.enterprise.login.link.text': {
    id: 'authn.enterprise.login.link.text',
    defaultMessage: 'Sign in with your company or school',
    description: 'Company or school login link text.',
  },
});

export default messages;
