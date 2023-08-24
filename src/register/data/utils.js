import { snakeCaseObject } from '@edx/frontend-platform';

import { LETTER_REGEX, NUMBER_REGEX } from '../../data/constants';
import messages from '../messages';
import { COUNTRY_FIELD_LABEL } from '../RegistrationFields/CountryField/constants';

export const validatePasswordField = (value, formatMessage) => {
  let fieldError = '';
  if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
    fieldError = formatMessage(messages['password.validation.message']);
  }
  return fieldError;
};

export const isFormValid = (
  payload,
  errors,
  configurableFormFields,
  fieldDescriptions,
  formatMessage,
) => {
  const fieldErrors = { ...errors };
  let isValid = true;
  Object.keys(payload).forEach(key => {
    if (!payload[key]) {
      fieldErrors[key] = formatMessage(messages[`empty.${key}.field.error`]);
    }
    if (fieldErrors[key]) {
      isValid = false;
    }
  });

  if (!configurableFormFields?.country?.displayValue) {
    fieldErrors.country = formatMessage(messages['empty.country.field.error']);
    isValid = false;
  }

  Object.keys(fieldDescriptions).forEach(key => {
    if (key === COUNTRY_FIELD_LABEL && !configurableFormFields.country.displayValue) {
      fieldErrors[key] = formatMessage(messages['empty.country.field.error']);
    } else if (!configurableFormFields[key]) {
      fieldErrors[key] = fieldDescriptions[key].error_message;
    }
    if (fieldErrors[key]) {
      isValid = false;
    }
  });

  return { isValid, fieldErrors };
};

export const prepareRegistrationPayload = (
  initPayload,
  configurableFormFields,
  showMarketingEmailOptInCheckbox,
  totalRegistrationTime,
  queryParams,
) => {
  let payload = { ...initPayload };
  Object.keys(configurableFormFields).forEach((fieldName) => {
    if (fieldName === 'country') {
      payload[fieldName] = configurableFormFields[fieldName].countryCode;
    } else {
      payload[fieldName] = configurableFormFields[fieldName];
    }
  });

  // Don't send the marketing email opt-in value if the flag is turned off
  if (!showMarketingEmailOptInCheckbox) {
    delete payload.marketingEmailsOptIn;
  }

  payload = snakeCaseObject(payload);
  payload.totalRegistrationTime = totalRegistrationTime;

  // add query params to the payload
  payload = { ...payload, ...queryParams };
  return payload;
};
