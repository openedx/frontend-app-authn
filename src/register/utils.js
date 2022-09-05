import { distance } from 'fastest-levenshtein';

import {
  COMMON_EMAIL_PROVIDERS, DEFAULT_SERVICE_PROVIDER_DOMAINS, DEFAULT_TOP_LEVEL_DOMAINS,
} from './data/constants';

function getLevenshteinSuggestion(word, knownWords, similarityThreshold = 4) {
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
}

export function getSuggestionForInvalidEmail(domain, username) {
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
}

export function validateEmailAddress(value, username, domainName) {
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
}
