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
    defaultMessage: 'Back to sign in',
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
  'logistration.sign.in.heading': {
    id: 'logistration.sign.in.heading',
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
  'logistration.email.ratelimit.less.chars.validation.message': {
    id: 'logistration.email.ratelimit.less.chars.validation.message',
    defaultMessage: 'Email must have 3 characters.',
    description: 'Validation message that appears when email address is less than 3 characters',
  },
  'logistration.email.ratelimit.incorrect.format.validation.message': {
    id: 'logistration.email.ratelimit.incorrect.format.validation.message',
    defaultMessage: 'The email address you provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address is not formatted correctly with no backend validations available.',
  },
  'logistration.email.ratelimit.password.validation.message': {
    id: 'logistration.email.ratelimit.password.validation.message',
    defaultMessage: 'Your password must contain at least 8 characters',
    description: 'Validation message that appears when password is not formatted correctly with no backend validations available.',
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
  'logistration.username.ratelimit.less.chars.message': {
    id: 'logistration.username.ratelimit.less.chars.message',
    defaultMessage: 'Public Username must have atleast 2 characters.',
    description: 'Validation message that appears when username is less than 2 characters and with no backend validations available.',
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
  // Account Activation Strings
  'authn.account.activation.success.message.title': {
    id: 'authn.account.activation.success.message.title',
    defaultMessage: 'Success! You have activated your account.',
    description: 'Account Activation success message title',
  },
  'authn.account.activation.success.message': {
    id: 'authn.account.activation.success.message',
    defaultMessage: 'You will now receive email updates and alerts from us related to the courses you are enrolled in. Sign In to continue.',
    description: 'Message show to learners when their account has been activated successfully',
  },
  'authn.account.already.activated.message': {
    id: 'authn.account.already.activated.message',
    defaultMessage: 'This account has already been activated.',
    description: 'Message shown when learner account has already been activated',
  },
  'authn.account.activation.error.message.title': {
    id: 'authn.account.activation.error.message.title',
    defaultMessage: 'Your account could not be activated',
    description: 'Account Activation error message title',
  },
  'authn.account.activation.support.link': {
    id: 'authn.account.activation.support.link',
    defaultMessage: 'contact support',
    description: 'Link text used in account activation error message to go to learner help center',
  },
  // Confirmation Alert Message
  'authn.forgot.password.confirmation.title': {
    id: 'authn.forgot.password.confirmation.title',
    defaultMessage: 'Check Your Email',
    description: 'Forgot password confirmation message title',
  },
  'authn.forgot.password.confirmation.support.link': {
    id: 'authn.forgot.password.confirmation.support.link',
    defaultMessage: 'contact technical support',
    description: 'Technical support link text',
  },
  'authn.forgot.password.confirmation.info': {
    id: 'authn.forgot.password.confirmation.info',
    defaultMessage: 'If you do not receive a password reset message after 1 minute, verify that you entered the correct '
                    + 'email address, or check your spam folder.',
    description: 'Part of message that appears after user requests password change',
  },
  // Login Failure Messages
  'logistration.login.failure.header.title': {
    id: 'logistration.login.failure.header.title',
    defaultMessage: 'We couldn\'t sign you in.',
    description: 'Login failure header message.',
  },
  'logistration.contact.support.link': {
    id: 'logistration.contact.support.link',
    defaultMessage: 'contact {platformName} Support',
    description: 'Link text used in inactive user error message to go to learner help center',
  },
  'login.rate.limit.reached.message': {
    id: 'login.rate.limit.reached.message',
    defaultMessage: 'Too many failed login attempts. Try again later.',
    description: 'Error message that appears when an anonymous user has made too many failed login attempts',
  },
  'authn.internal.server.error.message': {
    id: 'authn.internal.server.error.message',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your Internet connection.',
    description: 'Error message that appears when server responds with 500 error code',
  },
});

export default messages;
