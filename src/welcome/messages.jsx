import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'progressive.profiling.page.title': {
    id: 'progressive.profiling.page.title',
    defaultMessage: 'Optional Fields | {siteName}',
    description: 'progressive profiling page title',
  },
  'progressive.profiling.page.heading': {
    id: 'progressive.profiling.page.heading',
    defaultMessage: 'A few questions for you will help us get smarter.',
    description: 'The page heading for the progressive profiling page.',
  },
  'gender.options.label': {
    id: 'gender.options.label',
    defaultMessage: 'Gender (optional)',
    description: 'Placeholder for the gender options dropdown',
  },
  'gender.options.f': {
    id: 'gender.options.f',
    defaultMessage: 'Female',
    description: 'The label for the female gender option.',
  },
  'gender.options.m': {
    id: 'gender.options.m',
    defaultMessage: 'Male',
    description: 'The label for the male gender option.',
  },
  'gender.options.o': {
    id: 'gender.options.o',
    defaultMessage: 'Other/Prefer not to say',
    description: 'The label for catch-all gender option.',
  },
  'reason.options.label': {
    id: 'reason.options.label',
    defaultMessage: 'Purpose (optional)',
    description: 'Placeholder for the reasons options dropdown',
  },
  'reason.options.job': {
    id: 'reason.options.job',
    defaultMessage: 'Finding a job',
    description: 'edX grants unlimited opportunities to expand and grow one\' career',
  },
  'reason.options.learn': {
    id: 'reason.options.learn',
    defaultMessage: 'Learning tons of shit',
    description: 'edX ever increasing catalog of a wide array of courses allows one to explore new ares of knowledge and challenge their perception of the world.',
  },
  'reason.options.boss': {
    id: 'reason.options.boss',
    defaultMessage: 'My boss made me',
    description: 'edX allows businesses and institutions to empower their employees on a mass scale, offering opportunities to learn to countless learners.',
  },
  'education.levels.label': {
    id: 'education.levels.label',
    defaultMessage: 'Highest level of education completed (optional)',
    description: 'Placeholder for the education levels dropdown.',
  },
  'education.levels.p': {
    id: 'education.levels.p',
    defaultMessage: 'Doctorate',
    description: 'Selected by the user if their highest level of education is a doctorate degree.',
  },
  'education.levels.m': {
    id: 'education.levels.m',
    defaultMessage: "Master's or professional degree",
    description: "Selected by the user if their highest level of education is a master's or professional degree from a college or university.",
  },
  'education.levels.b': {
    id: 'education.levels.b',
    defaultMessage: "Bachelor's degree",
    description: "Selected by the user if their highest level of education is a four year college or university bachelor's degree.",
  },
  'education.levels.a': {
    id: 'education.levels.a',
    defaultMessage: "Associate's degree",
    description: "Selected by the user if their highest level of education is an associate's degree. 1-2 years of college or university.",
  },
  'education.levels.hs': {
    id: 'education.levels.hs',
    defaultMessage: 'Secondary/high school',
    description: 'Selected by the user if their highest level of education is secondary or high school.  9-12 years of education.',
  },
  'education.levels.jhs': {
    id: 'education.levels.jhs',
    defaultMessage: 'Junior secondary/junior high/middle school',
    description: 'Selected by the user if their highest level of education is junior or middle school. 6-8 years of education.',
  },
  'education.levels.el': {
    id: 'education.levels.el',
    defaultMessage: 'Elementary/primary school',
    description: 'Selected by the user if their highest level of education is elementary or primary school.  1-5 years of education.',
  },
  'education.levels.none': {
    id: 'education.levels.none',
    defaultMessage: 'No formal education',
    description: 'Selected by the user to describe their education.',
  },
  'education.levels.other': {
    id: 'education.levels.other',
    defaultMessage: 'Other education',
    description: 'Selected by the user if they have a type of education not described by the other choices.',
  },
  'year.of.birth.label': {
    id: 'year.of.birth.label',
    defaultMessage: 'Year of birth (optional)',
    description: 'Placeholder for the year of birth options dropdown',
  },
  'optional.fields.information.link': {
    id: 'optional.fields.information.link',
    defaultMessage: 'Learn more about how we use this information.',
    description: 'Optional fields page information link',
  },
  'optional.fields.submit.button': {
    id: 'optional.fields.submit.button',
    defaultMessage: 'Submit',
    description: 'Submit button text',
  },
  'optional.fields.skip.button': {
    id: 'optional.fields.skip.button',
    defaultMessage: 'Skip for now',
    description: 'Skip button text',
  },
  // modal dialog box
  'continue.to.platform': {
    id: 'continue.to.platform',
    defaultMessage: 'Continue to {platformName}',
    description: 'Button text for modal when user chooses "skip for now" option',
  },
  'modal.title': {
    id: 'modal.title',
    defaultMessage: 'Thanks for letting us know.',
    description: 'Heading for welcome page modal',
  },
  'modal.description': {
    id: 'modal.description',
    defaultMessage: 'You can complete your profile in settings at any time if you change your mind.',
    description: 'Modal body text',
  },
  // error message
  'welcome.page.error.heading': {
    id: 'welcome.page.error.heading',
    defaultMessage: 'We couldn\'t update your profile',
    description: 'Error message heading',
  },
  'welcome.page.error.message': {
    id: 'welcome.page.error.message',
    defaultMessage: 'An error occurred. You can complete your profile in settings at any time.',
    description: 'Error message body',
  },
});
export default messages;
