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
  // Help text
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
  'create.account.button': {
    id: 'create.account.button',
    defaultMessage: 'Create an account',
    description: 'Button label that appears on register page',
  },
  'registration.other.options.heading': {
    id: 'registration.other.options.heading',
    defaultMessage: 'Or register with:',
    description: 'A message that appears above third party auth providers i.e saml, google, facebook etc',
  },
  'register.institution.login.button': {
    id: 'register.institution.login.button',
    defaultMessage: 'Use my institution/campus credentials',
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
  'create.an.account.btn.pending.state': {
    id: 'create.an.account.btn.pending.state',
    defaultMessage: 'Loading',
    description: 'Message that appears for screen readers only when button is in pending state',
  },
  'register.rate.limit.reached.message': {
    id: 'register.rate.limit.reached.message',
    defaultMessage: 'Too many failed registration attempts. Try again later.',
    description: 'Error message that appears when an anonymous user has made too many failed registration attempts',
  },
  'email.validation.message': {
    id: 'email.validation.message',
    defaultMessage: 'Please enter your email.',
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
  'register.page.password.validation.message': {
    id: 'register.page.password.validation.message',
    defaultMessage: 'Please enter your password.',
    description: 'Validation message that appears when password is non compliant with edX requirement',
  },
  'fullname.validation.message': {
    id: 'fullname.validation.message',
    defaultMessage: 'Please enter your full name.',
    description: 'Validation message that appears when fullname is empty',
  },

  'username.validation.message': {
    id: 'username.validation.message',
    defaultMessage: 'Please enter your public username.',
    description: 'Validation message that appears when username is invalid',
  },
  'username.format.validation.message': {
    id: 'username.format.validation.message',
    defaultMessage: 'Usernames can only contain letters (A-Z, a-z), numerals (0-9), underscores (_), and hyphens (-).',
    description: 'Validation message that appears when username format is invalid',
  },
  'username.character.validation.message': {
    id: 'username.character.validation.message',
    defaultMessage: 'Your password must contain at least 1 letter.',
    description: 'Validation message that appears when password does not contain letter',
  },
  'username.number.validation.message': {
    id: 'username.number.validation.message',
    defaultMessage: 'Your password must contain at least 1 number.',
    description: 'Validation message that appears when password does not contain number',
  },
  'username.ratelimit.less.chars.message': {
    id: 'username.ratelimit.less.chars.message',
    defaultMessage: 'Public username must have atleast 2 characters.',
    description: 'Validation message that appears when username is less than 2 characters and with no backend validations available.',
  },
  'country.validation.message': {
    id: 'country.validation.message',
    defaultMessage: 'Select your country or region of residence.',
    description: 'Validation message that appears when country is not selected',
  },
  'support.education.research': {
    id: 'support.education.research',
    defaultMessage: 'Support education research by providing additional information. (Optional)',
    description: 'Text for a checkbox to ask user for if they are willing to provide extra information for education research',
  },
  'registration.request.server.error': {
    id: 'registration.request.server.error',
    defaultMessage: 'An error has occurred. Try refreshing the page, or check your internet connection.',
    description: 'error message on server error.',
  },
  'registration.request.failure.header': {
    id: 'registration.request.failure.header',
    defaultMessage: 'We couldn\'t create your account.',
    description: 'error message when registration failure.',
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
  'registration.username.suggestion.label': {
    id: 'registration.username.suggestion.label',
    defaultMessage: 'Available:',
    description: 'Available usernames label text.',
  },
});

export default messages;
