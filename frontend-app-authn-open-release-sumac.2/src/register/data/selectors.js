import { createSelector } from 'reselect';

/**
 * Selector for backend validations which processes the api output and generates a
 * key value dict for field errors.
 * @returns {{username: string}|{name: string}|*|{}|null}
 */
const getRegistrationError = state => state.register.registrationError;
const getValidations = state => state.register.validations;

const getBackendValidations = createSelector(
  [getRegistrationError, getValidations],
  (registrationError, validations) => {
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
  });

export default getBackendValidations;
