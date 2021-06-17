import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'login.page.title': {
    id: 'login.page.title',
    defaultMessage: 'Login | {siteName}',
    description: 'login page title',
  },
  'sign.in.button': {
    id: 'sign.in.button',
    defaultMessage: 'Sign in',
    description: 'Button label that appears on login page',
  },
  'need.help.signing.in.collapsible.menu': {
    id: 'need.help.signing.in.collapsible.menu',
    defaultMessage: 'Need help signing in?',
    description: 'A button for collapsible need help signing in menu on login page',
  },
  'forgot.password.link': {
    id: 'forgot.password.link',
    defaultMessage: 'Forgot my password',
    description: 'Forgot password link',
  },
  'other.sign.in.issues': {
    id: 'other.sign.in.issues',
    defaultMessage: 'Other sign in issues',
    description: 'A link that redirects to sign-in issues help',
  },
  'need.other.help.signing.in.collapsible.menu': {
    id: 'need.other.help.signing.in.collapsible.menu',
    defaultMessage: 'Need other help signing in?',
    description: 'A button for collapsible need other help signing in menu on forgot password page',
  },
  'institution.login.button': {
    id: 'institution.login.button',
    defaultMessage: 'Use my university info',
    description: 'shows institutions list',
  },
  'institution.login.page.title': {
    id: 'institution.login.page.title',
    defaultMessage: 'Sign in with institution/campus credentials',
    description: 'Heading of institution page',
  },
  'institution.login.page.sub.heading': {
    id: 'institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below:',
    description: 'Heading of the institutions list',
  },
  'institution.login.page.back.button': {
    id: 'institution.login.page.back.button',
    defaultMessage: 'Back to sign in',
    description: 'return to login page',
  },
  'create.an.account': {
    id: 'create.an.account',
    defaultMessage: 'Create an account',
    description: 'Message on button to return to register page',
  },
  'or.sign.in.with': {
    id: 'or.sign.in.with',
    defaultMessage: 'or sign in with',
    description: 'gives hint about other sign in options',
  },
  'non.compliant.password.title': {
    id: 'non.compliant.password.title',
    defaultMessage: 'We recently changed our password requirements',
    description: 'A title that appears in bold before error message for non-compliant password',
  },
  'first.time.here': {
    id: 'first.time.here',
    defaultMessage: 'First time here?',
    description: 'A question that appears before sign up link',
  },
  'email.label': {
    id: 'email.label',
    defaultMessage: 'Email',
    description: 'Label that appears above email field',
  },
  'email.help.message': {
    id: 'email.help.message',
    defaultMessage: 'The email address you used to register with edX.',
    description: 'Message that appears below email field on login page',
  },
  'enterprise.login.link.text': {
    id: 'enterprise.login.link.text',
    defaultMessage: 'Sign in with your company or school',
    description: 'Company or school login link text.',
  },
  'email.format.validation.message': {
    id: 'email.format.validation.message',
    defaultMessage: 'The email address you\'ve provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address format is incorrect',
  },
  'email.format.validation.less.chars.message': {
    id: 'email.format.validation.less.chars.message',
    defaultMessage: 'Email must have at least 3 characters.',
    description: 'Validation message that appears when email address is less than 3 characters',
  },
  'email.validation.message': {
    id: 'email.validation.message',
    defaultMessage: 'Please enter your email.',
    description: 'Validation message that appears when email is empty',
  },
  'password.validation.message': {
    id: 'password.validation.message',
    defaultMessage: 'Please enter your password.',
    description: 'Validation message that appears when password is empty',
  },
  'password.label': {
    id: 'password.label',
    defaultMessage: 'Password',
    description: 'Text that appears above password field or as a placeholder',
  },
  'register.link': {
    id: 'register.link',
    defaultMessage: 'Create an account',
    description: 'Register page link',
  },
  'sign.in.heading': {
    id: 'sign.in.heading',
    defaultMessage: 'Sign in',
    description: 'Sign in text',
  },
  // Account Activation Strings
  'account.activation.success.message.title': {
    id: 'account.activation.success.message.title',
    defaultMessage: 'Success! You have activated your account.',
    description: 'Account Activation success message title',
  },
  'account.activation.success.message': {
    id: 'account.activation.success.message',
    defaultMessage: 'You will now receive email updates and alerts from us related to the courses you are enrolled in. Sign in to continue.',
    description: 'Message show to learners when their account has been activated successfully',
  },
  'account.already.activated.message': {
    id: 'account.already.activated.message',
    defaultMessage: 'This account has already been activated.',
    description: 'Message shown when learner account has already been activated',
  },
  'account.activation.error.message.title': {
    id: 'account.activation.error.message.title',
    defaultMessage: 'Your account could not be activated',
    description: 'Account Activation error message title',
  },
  'account.activation.support.link': {
    id: 'account.activation.support.link',
    defaultMessage: 'contact support',
    description: 'Link text used in account activation error message to go to learner help center',
  },
  'internal.server.error.message': {
    id: 'internal.server.error.message',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'Error message that appears when server responds with 500 error code',
  },
  'login.rate.limit.reached.message': {
    id: 'login.rate.limit.reached.message',
    defaultMessage: 'Too many failed login attempts. Try again later.',
    description: 'Error message that appears when an anonymous user has made too many failed login attempts',
  },
  'login.failure.header.title': {
    id: 'login.failure.header.title',
    defaultMessage: 'We couldn\'t sign you in.',
    description: 'Login failure header message.',
  },
  'contact.support.link': {
    id: 'contact.support.link',
    defaultMessage: 'contact {platformName} support',
    description: 'Link text used in inactive user error message to go to learner help center',
  },
  'login.failed.link.text': {
    id: 'login.failed.link.text',
    defaultMessage: 'here',
    description: 'Link text used in failed login attempt user error message to reset password',
  },
  'login.incorrect.credentials.error': {
    id: 'login.incorrect.credentials.error',
    defaultMessage: 'Email or password is incorrect.',
    description: 'Error message for incorrect email or password',
  },
  'login.failed.attempt.error': {
    id: 'login.failed.attempt.error',
    defaultMessage: 'You have {remainingAttempts} more sign in attempts before your account is temporarily locked.',
    description: 'Failed login attempts error message',
  },
  'login.locked.out.error.message': {
    id: 'login.locked.out.error.message',
    defaultMessage: 'To protect your account, it’s been temporarily locked. Try again in {lockedOutPeriod} minutes.',
    description: 'Account locked out user message',
  },
});

export default messages;
