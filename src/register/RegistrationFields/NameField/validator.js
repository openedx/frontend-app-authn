import messages from '../../messages';

// regex more focused towards url matching
export const URL_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line no-useless-escape

// regex for html tags
export const HTML_REGEX = /<|>/u;

// regex from backend
export const INVALID_NAME_REGEX = /https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))*/g;

const validateName = (value, fieldName, formatMessage) => {
  let fieldError;
  if (!value.trim()) {
    fieldError = fieldName === 'lastName'
      ? formatMessage(messages['empty.lastName.field.error'])
      : formatMessage(messages['empty.firstName.field.error']);
  } else if (URL_REGEX.test(value) || HTML_REGEX.test(value) || INVALID_NAME_REGEX.test(value)) {
    fieldError = fieldName === 'lastName'
      ? formatMessage(messages['lastName.validation.message'])
      : formatMessage(messages['firstName.validation.message']);
  }
  return fieldError;
};

export default validateName;
