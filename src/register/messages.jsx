import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'create.account.button': {
    id: 'create.account.button',
    defaultMessage: 'Create Account',
    description: 'Button label that appears on register page',
  },
  'already.have.an.edx.account': {
    id: 'already.have.an.edx.account',
    defaultMessage: 'Already have an edX account?',
    description: 'A message on registration page asking the user if he already has an edX account',
  },
  'sign.in.hyperlink': {
    id: 'sign.in.hyperlink',
    defaultMessage: ' Sign in.',
    description: 'Text for the hyperlink that takes user to login page',
  },
  'create.an.account.using': {
    id: 'create.an.account.using',
    defaultMessage: 'Create an account using',
    description: 'A message that appears before social auth buttons',
  },
  'create.a.new.one.here': {
    id: 'create.a.new.one.here',
    defaultMessage: 'or create a new one here',
    description: 'Text that appears after social auth buttons and before the registration form',
  },
  'register.institution.login.button': {
    id: 'register.institution.login.button',
    defaultMessage: 'Use my institution/campus credentials',
    description: 'shows institutions list',
  },
  'register.institution.login.page.title': {
    id: 'register.institution.login.page.title',
    defaultMessage: 'Register with Institution/Campus Credentials',
    description: 'Heading of institution page',
  },
  'create.an.account': {
    id: 'create.an.account',
    defaultMessage: 'Create an Account',
    description: 'Message on button to return to register page',
  },
  'register.page.email.label': {
    id: 'register.page.email.label',
    defaultMessage: 'Email (required)',
    description: 'Label that appears above email field on register page',
  },
  'email.validation.message': {
    id: 'email.validation.message',
    defaultMessage: 'Please enter your Email.',
    description: 'Validation message that appears when email address is empty',
  },
  'email.ratelimit.less.chars.validation.message': {
    id: 'email.ratelimit.less.chars.validation.message',
    defaultMessage: 'Email must have 3 characters.',
    description: 'Validation message that appears when email address is less than 3 characters',
  },
  'email.ratelimit.incorrect.format.validation.message': {
    id: 'email.ratelimit.incorrect.format.validation.message',
    defaultMessage: 'The email address you provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address is not formatted correctly with no backend validations available.',
  },
  'email.ratelimit.password.validation.message': {
    id: 'email.ratelimit.password.validation.message',
    defaultMessage: 'Your password must contain at least 8 characters',
    description: 'Validation message that appears when password is not formatted correctly with no backend validations available.',
  },
  'password.label': {
    id: 'password.label',
    defaultMessage: 'Password (required)',
    description: 'Label that appears above password field',
  },
  'register.page.password.validation.message': {
    id: 'register.page.password.validation.message',
    defaultMessage: 'Please enter your Password.',
    description: 'Validation message that appears when password is non compliant with edX requirement',
  },
  'fullname.label': {
    id: 'fullname.label',
    defaultMessage: 'Full Name (required)',
    description: 'Label that appears above fullname field',
  },
  'fullname.validation.message': {
    id: 'fullname.validation.message',
    defaultMessage: 'Please enter your Full Name.',
    description: 'Validation message that appears when fullname is empty',
  },
  'username.label': {
    id: 'username.label',
    defaultMessage: 'Public Username (required)',
    description: 'Label that appears above username field',
  },
  'username.validation.message': {
    id: 'username.validation.message',
    defaultMessage: 'Please enter your Public Username.',
    description: 'Validation message that appears when username is invalid',
  },
  'username.ratelimit.less.chars.message': {
    id: 'username.ratelimit.less.chars.message',
    defaultMessage: 'Public Username must have atleast 2 characters.',
    description: 'Validation message that appears when username is less than 2 characters and with no backend validations available.',
  },
  'country.validation.message': {
    id: 'country.validation.message',
    defaultMessage: 'Select your country or region of residence.',
    description: 'Validation message that appears when country is not selected',
  },
  'support.education.research': {
    id: 'support.education.research',
    defaultMessage: 'Support education research by providing additional information',
    description: 'Text for a checkbox to ask user for if they are willing to provide extra information for education research',
  },
  'register.optional.label': {
    id: 'register.optional.label',
    defaultMessage: '(optional)',
    description: 'Text that appears with optional field labels',
  },
});

export default messages;
