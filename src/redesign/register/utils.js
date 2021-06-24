import { distance } from 'fastest-levenshtein';

export default function getLevenshteinSuggestion(word, knownWords, similarityThreshold = 4) {
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
