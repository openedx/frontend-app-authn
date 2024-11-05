import messages from '../../messages';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 30;

// Regex para permitir solo letras y un espacio en el medio (sin números ni caracteres especiales)
export const VALID_NAME_REGEX = /^[a-zA-Z]+( [a-zA-Z]+)*$/u;

// Regex para URL
export const URL_REGEX = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;

// Regex para etiquetas HTML
export const HTML_REGEX = /<|>/u;

// Regex de URLs del backend
export const INVALID_NAME_REGEX = /https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))/g;

const validateName = (value, formatMessage) => {
  let fieldError = '';
  const trimmedValue = value.trim();

  const isEmpty = !trimmedValue;
  const isInvalidLength = trimmedValue.length < MIN_NAME_LENGTH || trimmedValue.length > MAX_NAME_LENGTH;
  const hasInvalidCharacters = !VALID_NAME_REGEX.test(trimmedValue);
  const containsUrlOrHtml = (
    URL_REGEX.test(trimmedValue)
    || HTML_REGEX.test(trimmedValue)
    || INVALID_NAME_REGEX.test(trimmedValue)
  );

  if (isEmpty) {
    fieldError = formatMessage(messages['empty.name.field.error']);
  } else if (isInvalidLength || hasInvalidCharacters || containsUrlOrHtml) {
    fieldError = formatMessage(messages['name.validation.message']);
  }

  return fieldError;
};

export default validateName;
