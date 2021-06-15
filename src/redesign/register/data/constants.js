// Registration Error Codes
export const FORBIDDEN_REQUEST = 'forbidden-request';
export const FORM_SUBMISSION_ERROR = 'form-submission-error';
export const INTERNAL_SERVER_ERROR = 'internal-server-error';
export const TPA_SESSION_EXPIRED = 'tpa-session-expired';

export const YEAR_OF_BIRTH_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  let startYear = currentYear - 120;
  while (startYear < currentYear) {
    startYear += 1;

    years.push({ value: startYear.toString(), label: startYear });
  }
  return years.reverse();
})();

export const EDUCATION_LEVELS = [
  '',
  'p',
  'm',
  'b',
  'a',
  'hs',
  'jhs',
  'el',
  'none',
  'other',
];

export const GENDER_OPTIONS = ['', 'f', 'm', 'o'];

// Other constants
export const FORM_FIELDS = ['name', 'email', 'password', 'username', 'country'];
