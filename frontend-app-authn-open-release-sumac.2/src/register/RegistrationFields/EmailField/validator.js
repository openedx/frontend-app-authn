import { distance } from 'fastest-levenshtein';

import {
  COMMON_EMAIL_PROVIDERS,
  DEFAULT_SERVICE_PROVIDER_DOMAINS,
  DEFAULT_TOP_LEVEL_DOMAINS,
} from './constants';
import { VALID_EMAIL_REGEX } from '../../../data/constants';
import messages from '../../messages';

export const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');

export const getLevenshteinSuggestion = (word, knownWords, similarityThreshold = 4) => {
  if (!word) {
    return null;
  }

  let minEditDistance = 100;
  let mostSimilar = word;

  for (let i = 0; i < knownWords.length; i++) {
    const editDistance = distance(knownWords[i].toLowerCase(), word.toLowerCase());
    if (editDistance < minEditDistance) {
      minEditDistance = editDistance;
      mostSimilar = knownWords[i];
    }
  }

  return minEditDistance <= similarityThreshold && word !== mostSimilar ? mostSimilar : null;
};

export const getSuggestionForInvalidEmail = (domain, username) => {
  if (!domain) {
    return '';
  }

  const defaultDomains = ['yahoo', 'aol', 'hotmail', 'live', 'outlook', 'gmail'];
  const suggestion = getLevenshteinSuggestion(domain, COMMON_EMAIL_PROVIDERS);

  if (suggestion) {
    return `${username}@${suggestion}`;
  }

  for (let i = 0; i < defaultDomains.length; i++) {
    if (domain.includes(defaultDomains[i])) {
      return `${username}@${defaultDomains[i]}.com`;
    }
  }

  return '';
};

export const validateEmailAddress = (value, username, domainName) => {
  let suggestion = null;
  const validation = {
    hasError: false,
    suggestion: '',
    type: '',
  };

  const hasMultipleSubdomains = value.match(/\./g).length > 1;
  const [serviceLevelDomain, topLevelDomain] = domainName.split('.');
  const tldSuggestion = !DEFAULT_TOP_LEVEL_DOMAINS.includes(topLevelDomain);
  const serviceSuggestion = getLevenshteinSuggestion(serviceLevelDomain, DEFAULT_SERVICE_PROVIDER_DOMAINS, 2);

  if (DEFAULT_SERVICE_PROVIDER_DOMAINS.includes(serviceSuggestion || serviceLevelDomain)) {
    suggestion = `${username}@${serviceSuggestion || serviceLevelDomain}.com`;
  }

  if (!hasMultipleSubdomains && tldSuggestion) {
    validation.suggestion = suggestion;
    validation.type = 'error';
  } else if (serviceSuggestion) {
    validation.suggestion = suggestion;
    validation.type = 'warning';
  } else {
    suggestion = getLevenshteinSuggestion(domainName, COMMON_EMAIL_PROVIDERS, 3);
    if (suggestion) {
      validation.suggestion = `${username}@${suggestion}`;
      validation.type = 'warning';
    }
  }

  if (!hasMultipleSubdomains && tldSuggestion) {
    validation.hasError = true;
  }

  return validation;
};

const validateEmail = (value, confirmEmailValue, formatMessage) => {
  let fieldError = '';
  let confirmEmailError = '';
  let emailSuggestion = { suggestion: '', type: '' };

  if (!value) {
    fieldError = formatMessage(messages['empty.email.field.error']);
  } else if (value.length <= 2) {
    fieldError = formatMessage(messages['email.invalid.format.error']);
  } else {
    const [username, domainName] = value.split('@');
    // Check if email address is invalid. If we have a suggestion for invalid email
    // provide that along with the error message.
    if (!emailRegex.test(value)) {
      fieldError = formatMessage(messages['email.invalid.format.error']);
      emailSuggestion = {
        suggestion: getSuggestionForInvalidEmail(domainName, username),
        type: 'error',
      };
    } else {
      const response = validateEmailAddress(value, username, domainName);
      if (response.hasError) {
        fieldError = formatMessage(messages['email.invalid.format.error']);
        delete response.hasError;
      }
      emailSuggestion = { ...response };

      if (confirmEmailValue && value !== confirmEmailValue) {
        confirmEmailError = formatMessage(messages['email.do.not.match']);
      }
    }
  }
  return { fieldError, confirmEmailError, suggestion: emailSuggestion };
};

export default validateEmail;
