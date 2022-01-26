import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'register.page.title': {
    id: 'register.page.title',
    defaultMessage: 'Register | {siteName}',
    description: 'register page title',
  },
  // Field labels
  'registration.fullname.label': {
    id: 'registration.fullname.label',
    defaultMessage: 'Full name',
    description: 'Label that appears above fullname field',
  },
  'registration.email.label': {
    id: 'registration.email.label',
    defaultMessage: 'Email',
    description: 'Label that appears above email field on register page',
  },
  'registration.username.label': {
    id: 'registration.username.label',
    defaultMessage: 'Public username',
    description: 'Label that appears above username field',
  },
  'registration.password.label': {
    id: 'registration.password.label',
    defaultMessage: 'Password',
    description: 'Label that appears above password field',
  },
  'registration.country.label': {
    id: 'registration.country.label',
    defaultMessage: 'Country/Region',
    description: 'Placeholder for the country options dropdown.',
  },
  'registration.opt.in.label': {
    id: 'registration.opt.in.label',
    defaultMessage: 'I agree that {siteName} may send me marketing messages.',
    description: 'Text for opt in option on register page.',
  },
  // Help text
  'help.text.name': {
    id: 'help.text.name',
    defaultMessage: 'This name will be used by any certificates that you earn.',
    description: 'Help text for fullname field on registration page',
  },
  'help.text.username.1': {
    id: 'help.text.username.1',
    defaultMessage: 'The name that will identify you in your courses.',
    description: 'Part of help text for username field on registration page',
  },
  'help.text.username.2': {
    id: 'help.text.username.2',
    defaultMessage: 'This can not be changed later.',
    description: 'Part of help text for username field on registration page',
  },
  'help.text.email': {
    id: 'help.text.email',
    defaultMessage: 'For account activation and important updates',
    description: 'Help text for email field on registration page',
  },
  // Form buttons
  'create.account.button': {
    id: 'create.account.button',
    defaultMessage: 'Create an account',
    description: 'Button label that appears on register page',
  },
  'register.for.free.button': {
    id: 'register.for.free.button',
    defaultMessage: 'Register for free',
    description: 'Label text for registration form submission button',
  },
  'create.an.account.btn.pending.state': {
    id: 'create.an.account.btn.pending.state',
    defaultMessage: 'Loading',
    description: 'Title of icon that appears when button is in pending state',
  },
  'registration.other.options.heading': {
    id: 'registration.other.options.heading',
    defaultMessage: 'Or register with:',
    description: 'A message that appears above third party auth providers i.e saml, google, facebook etc',
  },
  // Institution login
  'register.institution.login.button': {
    id: 'register.institution.login.button',
    defaultMessage: 'Institution/campus credentials',
    description: 'shows institutions list',
  },
  'register.institution.login.page.title': {
    id: 'register.institution.login.page.title',
    defaultMessage: 'Register with institution/campus credentials',
    description: 'Heading of institution page',
  },
  'create.an.account': {
    id: 'create.an.account',
    defaultMessage: 'Create an account',
    description: 'Message on button to return to register page',
  },
  // Validation messages
  'empty.name.field.error': {
    id: 'empty.name.field.error',
    defaultMessage: 'Enter your full name',
    description: 'Error message for empty fullname field',
  },
  'empty.email.field.error': {
    id: 'empty.email.field.error',
    defaultMessage: 'Enter your email',
    description: 'Error message for empty email field',
  },
  'empty.username.field.error': {
    id: 'empty.username.field.error',
    defaultMessage: 'Username must be between 2 and 30 characters',
    description: 'Error message for empty username field',
  },
  'empty.password.field.error': {
    id: 'empty.password.field.error',
    defaultMessage: 'Password criteria has not been met',
    description: 'Error message for empty password field',
  },
  'empty.country.field.error': {
    id: 'empty.country.field.error',
    defaultMessage: 'Select your country or region of residence',
    description: 'Error message when no country/region is selected',
  },
  'email.invalid.format.error': {
    id: 'email.invalid.format.error',
    defaultMessage: 'Enter a valid email address',
    description: 'Validation error for invalid email address',
  },
  'email.ratelimit.less.chars.validation.message': {
    id: 'email.ratelimit.less.chars.validation.message',
    defaultMessage: 'Email must have 3 characters.',
    description: 'Validation message that appears when email address is less than 3 characters',
  },
  'username.validation.message': {
    id: 'username.validation.message',
    defaultMessage: 'Username must be between 2 and 30 characters',
    description: 'Error message for empty username field',
  },
  'name.validation.message': {
    id: 'name.validation.message',
    defaultMessage: 'Enter a valid name',
    description: 'Validation message that appears when fullname contain URL',
  },
  'password.validation.message': {
    id: 'password.validation.message',
    defaultMessage: 'Password criteria has not been met',
    description: 'Error message for empty or invalid password',
  },
  'username.format.validation.message': {
    id: 'username.format.validation.message',
    defaultMessage: 'Usernames can only contain letters (A-Z, a-z), numerals (0-9), underscores (_), and hyphens (-). Usernames cannot contain spaces.',
    description: 'Validation message that appears when username format is invalid',
  },
  'support.education.research': {
    id: 'support.education.research',
    defaultMessage: 'Support education research by providing additional information. (Optional)',
    description: 'Text for a checkbox to ask user for if they are willing to provide extra information for education research',
  },
  // Error messages
  'registration.request.failure.header': {
    id: 'registration.request.failure.header',
    defaultMessage: 'We couldn\'t create your account.',
    description: 'error message when registration failure.',
  },
  'registration.empty.form.submission.error': {
    id: 'registration.empty.form.submission.error',
    defaultMessage: 'Please check your responses and try again.',
    description: 'Error message that appears on top of the form when empty form is submitted',
  },
  'registration.request.server.error': {
    id: 'registration.request.server.error',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'Error message for internal server error.',
  },
  'registration.rate.limit.error': {
    id: 'registration.rate.limit.error',
    defaultMessage: 'Too many failed registration attempts. Try again later.',
    description: 'Error message that appears when an anonymous user has made too many failed registration attempts',
  },
  'registration.tpa.session.expired': {
    id: 'registration.tpa.session.expired',
    defaultMessage: 'Registration using {provider} has timed out.',
    description: '',
  },
  // Terms of Service and Honor Code
  'terms.of.service.and.honor.code': {
    id: 'terms.of.service.and.honor.code',
    defaultMessage: 'Terms of Service and Honor Code',
    description: 'Text for the hyperlink that redirects user to terms of service and honor code',
  },
  'privacy.policy': {
    id: 'privacy.policy',
    defaultMessage: 'Privacy Policy',
    description: 'Text for the hyperlink that redirects user to privacy policy',
  },
  // Optional fields
  'registration.year.of.birth.label': {
    id: 'registration.year.of.birth.label',
    defaultMessage: 'Year of birth (optional)',
    description: 'Placeholder for the year of birth options dropdown',
  },
  'registration.field.gender.options.label': {
    id: 'registration.field.gender.options.label',
    defaultMessage: 'Gender (optional)',
    description: 'Placeholder for the gender options dropdown',
  },
  'registration.goals.label': {
    id: 'registration.goals.label',
    defaultMessage: 'Tell us why you\'re interested in edX (optional)',
    description: 'Placeholder for the goals options dropdown',
  },
  'registration.field.gender.options.f': {
    id: 'registration.field.gender.options.f',
    defaultMessage: 'Female',
    description: 'The label for the female gender option.',
  },
  'registration.field.gender.options.m': {
    id: 'registration.field.gender.options.m',
    defaultMessage: 'Male',
    description: 'The label for the male gender option.',
  },
  'registration.field.gender.options.o': {
    id: 'registration.field.gender.options.o',
    defaultMessage: 'Other/Prefer not to say',
    description: 'The label for catch-all gender option.',
  },
  'registration.field.education.levels.label': {
    id: 'registration.field.education.levels.label',
    defaultMessage: 'Highest level of education completed (optional)',
    description: 'Placeholder for the education levels dropdown.',
  },
  'registration.field.education.levels.p': {
    id: 'registration.field.education.levels.p',
    defaultMessage: 'Doctorate',
    description: 'Selected by the user if their highest level of education is a doctorate degree.',
  },
  'registration.field.education.levels.m': {
    id: 'registration.field.education.levels.m',
    defaultMessage: "Master's or professional degree",
    description: "Selected by the user if their highest level of education is a master's or professional degree from a college or university.",
  },
  'registration.field.education.levels.b': {
    id: 'registration.field.education.levels.b',
    defaultMessage: "Bachelor's degree",
    description: "Selected by the user if their highest level of education is a four year college or university bachelor's degree.",
  },
  'registration.field.education.levels.a': {
    id: 'registration.field.education.levels.a',
    defaultMessage: "Associate's degree",
    description: "Selected by the user if their highest level of education is an associate's degree. 1-2 years of college or university.",
  },
  'registration.field.education.levels.hs': {
    id: 'registration.field.education.levels.hs',
    defaultMessage: 'Secondary/high school',
    description: 'Selected by the user if their highest level of education is secondary or high school.  9-12 years of education.',
  },
  'registration.field.education.levels.jhs': {
    id: 'registration.field.education.levels.jhs',
    defaultMessage: 'Junior secondary/junior high/middle school',
    description: 'Selected by the user if their highest level of education is junior or middle school. 6-8 years of education.',
  },
  'registration.field.education.levels.el': {
    id: 'registration.field.education.levels.el',
    defaultMessage: 'Elementary/primary school',
    description: 'Selected by the user if their highest level of education is elementary or primary school.  1-5 years of education.',
  },
  'registration.field.education.levels.none': {
    id: 'registration.field.education.levels.none',
    defaultMessage: 'No formal education',
    description: 'Selected by the user to describe their education.',
  },
  'registration.field.education.levels.other': {
    id: 'registration.field.education.levels.other',
    defaultMessage: 'Other education',
    description: 'Selected by the user if they have a type of education not described by the other choices.',
  },
  // miscellaneous strings
  'registration.username.suggestion.label': {
    id: 'registration.username.suggestion.label',
    defaultMessage: 'Suggested:',
    description: 'Suggested usernames label text.',
  },
  'registration.using.tpa.form.heading': {
    id: 'registration.using.tpa.form.heading',
    defaultMessage: 'Finish creating your account',
    description: 'Heading that appears above form when user is trying to create account using social auth',
  },
  'did.you.mean.alert.text': {
    id: 'did.you.mean.alert.text',
    defaultMessage: 'Did you mean',
    description: 'Did you mean alert suggestion',
  },
  'certificate.msg': {
    id: 'certificate.msg',
    defaultMessage: '*Offer not eligible for GTx’s Analytics: Essential Tools and Methods MicroMasters Program, ColumbiaX’s Corporate Finance Professional Certificate Program, or courses or programs offered by Wharton, and NYIF.',
    description: 'Text for the 15% discount experiment',
  },
});

export default messages;
