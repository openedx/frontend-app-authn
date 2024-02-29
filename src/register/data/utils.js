import { getConfig, snakeCaseObject } from '@edx/frontend-platform';

import { LETTER_REGEX, NUMBER_REGEX } from '../../data/constants';
import messages from '../messages';
import validateEmail from '../RegistrationFields/EmailField/validator';
import validateName from '../RegistrationFields/NameField/validator';
import validateUsername from '../RegistrationFields/UsernameField/validator';

/**
 * It validates the password field value
 * @param value
 * @param formatMessage
 * @returns {string}
 */
export const validatePasswordField = (value, formatMessage) => {
  let fieldError = '';
  if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
    fieldError = formatMessage(messages['password.validation.message']);
  }
  return fieldError;
};

/**
 * It accepts complete registration data as payload and checks if the form is valid.
 * @param payload
 * @param errors
 * @param configurableFormFields
 * @param fieldDescriptions
 * @param formatMessage
 * @returns {{fieldErrors, isValid: boolean}}
 */
export const isFormValid = (
  payload,
  errors,
  configurableFormFields,
  fieldDescriptions,
  formatMessage,
) => {
  const fieldErrors = { ...errors };
  let isValid = true;
  let emailSuggestion = { suggestion: '', type: '' };
  Object.keys(payload).forEach(key => {
    switch (key) {
      case 'name':
        fieldErrors.name = validateName(payload.name, formatMessage);
        if (fieldErrors.name) { isValid = false; }
        break;
      case 'email': {
        const {
          fieldError, confirmEmailError, suggestion,
        } = validateEmail(payload.email, configurableFormFields?.confirm_email, formatMessage);
        if (fieldError) {
          fieldErrors.email = fieldError;
          isValid = false;
        }
        if (confirmEmailError) {
          fieldErrors.confirm_email = confirmEmailError;
          isValid = false;
        }
        emailSuggestion = suggestion;
        break;
      }
      case 'username':
        fieldErrors.username = validateUsername(payload.username, formatMessage);
        if (fieldErrors.username) { isValid = false; }
        break;
      case 'password':
        fieldErrors.password = validatePasswordField(payload.password, formatMessage);
        if (fieldErrors.password) { isValid = false; }
        break;
      default:
        break;
    }
  });

  if (getConfig().SHOW_CONFIGURABLE_EDX_FIELDS) {
    if (!configurableFormFields?.country?.displayValue) {
      fieldErrors.country = formatMessage(messages['empty.country.field.error']);
      isValid = false;
    }
  }
  Object.keys(fieldDescriptions).forEach(key => {
    if (key === 'country' && !configurableFormFields.country.displayValue) {
      fieldErrors[key] = formatMessage(messages['empty.country.field.error']);
    } else if (!configurableFormFields[key]) {
      fieldErrors[key] = fieldDescriptions[key].error_message;
    }
    if (fieldErrors[key]) { isValid = false; }
  });

  return { isValid, fieldErrors, emailSuggestion };
};

/**
 * It prepares a payload for registration data that can be passed to registration API endpoint.
 * @param initPayload
 * @param configurableFormFields
 * @param showMarketingEmailOptInCheckbox
 * @param totalRegistrationTime
 * @param queryParams
 * @returns {*}
 */
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

/**
 * A helper for backend validations selector. It processes the api output and generates a
 * key value dict for field errors.
 * @param registrationError
 * @param validations
 * @returns {{username: string}|{name: string}|*|{}|null}
 */
export const getBackendValidations = (registrationError, validations) => {
  if (validations) {
    return validations.validationDecisions;
  }

  if (Object.keys(registrationError).length > 0) {
    const fields = Object.keys(registrationError).filter(
      (fieldName) => !(fieldName in ['errorCode', 'usernameSuggestions']),
    );

    const validationDecisions = {};
    fields.forEach(field => {
      validationDecisions[field] = registrationError[field][0].userMessage || '';
    });
    return validationDecisions;
  }

  return null;
};
