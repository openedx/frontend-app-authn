import { distance } from 'fastest-levenshtein';
import { COMMON_EMAIL_PROVIDERS } from './data/constants';

export function getLevenshteinSuggestion(word, knownWords, similarityThreshold = 4) {
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
    return null;
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

  return null;
}
