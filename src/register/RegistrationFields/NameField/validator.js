import messages from '../../messages';

export const INVALID_NAME_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line no-useless-escape
export const urlRegex = new RegExp(INVALID_NAME_REGEX);

const validateName = (value, formatMessage) => {
  let fieldError = '';
  if (!value.trim()) {
    fieldError = formatMessage(messages['empty.name.field.error']);
  } else if (value && value.match(urlRegex)) {
    fieldError = formatMessage(messages['name.validation.message']);
  }
  return fieldError;
};

export default validateName;
