import { urlRegex } from './constants';
import messages from '../../messages';

const validateName = (value, formatMessage) => {
  let fieldError;
  if (!value.trim()) {
    fieldError = formatMessage(messages['empty.name.field.error']);
  } else if (value && value.match(urlRegex)) {
    fieldError = formatMessage(messages['name.validation.message']);
  }
  return fieldError;
};

export default validateName;
