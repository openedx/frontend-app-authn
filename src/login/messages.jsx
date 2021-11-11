import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'login.page.title': {
    id: 'login.page.title',
    defaultMessage: 'Login | {siteName}',
    description: 'login page title',
  },
  // Login labels
  'login.user.identity.label': {
    id: 'login.user.identity.label',
    defaultMessage: 'Username or email',
    description: 'Label for user identity field to enter either username or email to login',
  },
  'login.password.label': {
    id: 'login.password.label',
    defaultMessage: 'Password',
    description: 'Label for password field',
  },
  'sign.in.button': {
    id: 'sign.in.button',
    defaultMessage: 'Sign in',
    description: 'Button label that appears on login page',
  },
  'sign.in.btn.pending.state': {
    id: 'sign.in.btn.pending.state',
    defaultMessage: 'Loading',
    description: 'Title of icon that appears when button is in pending state',
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
  'forgot.password': {
    id: 'forgot.password',
    defaultMessage: 'Forgot password',
    description: 'Button text for forgot password',
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
    defaultMessage: 'Institution/campus credentials',
    description: 'shows institutions list',
  },
  'institution.login.page.title': {
    id: 'institution.login.page.title',
    defaultMessage: 'Sign in with institution/campus credentials',
    description: 'Heading of institution page',
  },
  'institution.login.page.sub.heading': {
    id: 'institution.login.page.sub.heading',
    defaultMessage: 'Choose your institution from the list below',
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
  'login.other.options.heading': {
    id: 'login.other.options.heading',
    defaultMessage: 'Or sign in with:',
    description: 'Text that appears above other sign in options like social auth buttons',
  },
  'non.compliant.password.title': {
    id: 'non.compliant.password.title',
    defaultMessage: 'We recently changed our password requirements',
    description: 'A title that appears in bold before error message for non-compliant password',
  },
  'non.compliant.password.message': {
    id: 'non.compliant.password.message',
    defaultMessage: 'Your current password does not meet the new security requirements. '
                    + 'We just sent a password-reset message to the email address associated with this account. '
                    + 'Thank you for helping us keep your data safe.',
    description: 'Error message for non-compliant password',
  },
  'account.locked.out.message.1': {
    id: 'account.locked.out.message.1',
    defaultMessage: 'To protect your account, it\'s been temporarily locked. Try again in 30 minutes.',
    description: 'Part of message for when user account has been locked out after multiple failed login attempts',
  },
  'first.time.here': {
    id: 'first.time.here',
    defaultMessage: 'First time here?',
    description: 'A question that appears before sign up link',
  },
  'email.help.message': {
    id: 'email.help.message',
    defaultMessage: 'The email address you used to register with edX.',
    description: 'Message that appears below email field on login page',
  },
  'enterprise.login.btn.text': {
    id: 'enterprise.login.btn.text',
    defaultMessage: 'Company or school credentials',
    description: 'Company or school login link text.',
  },
  'email.format.validation.message': {
    id: 'email.format.validation.message',
    defaultMessage: 'The email address you\'ve provided isn\'t formatted correctly.',
    description: 'Validation message that appears when email address format is incorrect',
  },
  'username.or.email.format.validation.less.chars.message': {
    id: 'username.or.email.format.validation.less.chars.message',
    defaultMessage: 'Username or email must have at least 3 characters.',
    description: 'Validation message that appears when username or email address is less than 3 characters',
  },
  'email.validation.message': {
    id: 'email.validation.message',
    defaultMessage: 'Enter your username or email',
    description: 'Validation message that appears when email is empty',
  },
  'password.validation.message': {
    id: 'password.validation.message',
    defaultMessage: 'Enter your password',
    description: 'Validation message that appears when password is empty',
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
  'account.activation.info.message': {
    id: 'account.activation.info.message',
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
  // Email Confirmation Strings
  'account.confirmation.success.message.title': {
    id: 'account.confirmation.success.message.title',
    defaultMessage: 'Success! You have confirmed your email.',
    description: 'Account verification success message title',
  },
  'account.confirmation.success.message': {
    id: 'account.confirmation.success.message',
    defaultMessage: 'Sign in to continue.',
    description: 'Message show to learners when their account has been activated successfully',
  },
  'account.confirmation.info.message': {
    id: 'account.confirmation.info.message',
    defaultMessage: 'This email has already been confirmed.',
    description: 'Message shown when learner account has already been verified',
  },
  'account.confirmation.error.message.title': {
    id: 'account.confirmation.error.message.title',
    defaultMessage: 'Your email could not be confirmed',
    description: 'Account verification error message title',
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
  'login.incorrect.credentials.error': {
    id: 'login.incorrect.credentials.error',
    defaultMessage: 'The username, email, or password you entered is incorrect. Please try again.',
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
  'login.form.invalid.error.message': {
    id: 'login.form.invalid.error.message',
    defaultMessage: 'Please fill in the fields below.',
    description: 'Login form empty input user message',
  },
  'login.incorrect.credentials.error.reset.link.text': {
    id: 'login.incorrect.credentials.error.reset.link.text',
    defaultMessage: 'reset your password',
    description: 'Reset password link text for incorrect email or password credentials',
  },
  'login.incorrect.credentials.error.before.account.blocked.text': {
    id: 'login.incorrect.credentials.error.before.account.blocked.text',
    defaultMessage: 'click here to reset it.',
    description: 'Reset password link text for incorrect email or password credentials before blocking account',
  },
});

export default messages;
