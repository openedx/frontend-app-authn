import messages from '../../messages';

export const VALID_USERNAME_REGEX = /^[a-zA-Z0-9_-]*$/i;
export const usernameRegex = new RegExp(VALID_USERNAME_REGEX, 'i');

const validateUsername = (value, formatMessage) => {
  let fieldError = '';
  if (!value || value.length <= 1 || value.length > 30) {
    fieldError = formatMessage(messages['username.validation.message']);
  } else if (!usernameRegex.test(value)) {
    fieldError = formatMessage(messages['username.format.validation.message']);
  }
  return fieldError;
};

export default validateUsername;
