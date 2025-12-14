import messages from '../../messages';

// regex more focused towards url matching
export const URL_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line no-useless-escape

// regex for html tags
export const HTML_REGEX = /<|>/u;

// regex from backend
export const INVALID_NAME_REGEX = /https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))*/g;

export const MAX_FULL_NAME_LENGTH = 255;

const validateName = (value, formatMessage) => {
  let fieldError = '';
  if (!value.trim()) {
    fieldError = formatMessage(messages['empty.name.field.error']);
  } else if (URL_REGEX.test(value) || HTML_REGEX.test(value) || INVALID_NAME_REGEX.test(value)) {
    fieldError = formatMessage(messages['name.validation.message']);
  } else if (value && value.length > MAX_FULL_NAME_LENGTH) {
    fieldError = formatMessage(messages['name.validation.length.message']);
  }
  return fieldError;
};

export default validateName;
