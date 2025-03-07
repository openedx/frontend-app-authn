import { COMMON_EMAIL_PROVIDERS } from './constants';
import {
  getLevenshteinSuggestion,
  getSuggestionForInvalidEmail,
} from './validator';

describe('Email Validators Utils', () => {
  describe('getLevenshteinSuggestion Tests', () => {
    it('test getLevenshteinSuggestion returns null for invalid word', () => {
      const output = getLevenshteinSuggestion('', COMMON_EMAIL_PROVIDERS);
      expect(output).toEqual(null);
    });

    it('test getLevenshteinSuggestion returns output for valid word', () => {
      const output = getLevenshteinSuggestion('gmail', COMMON_EMAIL_PROVIDERS);
      expect(output).toEqual('gmail.com');
    });
  });
  describe('getSuggestionForInvalidEmail Tests', () => {
    it('test getSuggestionForInvalidEmail returns empty string for invalid domain', () => {
      const output = getSuggestionForInvalidEmail('', 'username');
      expect(output).toEqual('');
    });

    it('test getSuggestionForInvalidEmail returns valid suggestion when domain is nearly matched', () => {
      const output = getSuggestionForInvalidEmail('gmail', 'username');
      expect(output).toEqual('username@gmail.com');
    });

    it('test getSuggestionForInvalidEmail returns valid suggestion for default domains', () => {
      const output = getSuggestionForInvalidEmail('aol', 'username');
      expect(output).toEqual('username@aol.com');
    });
    it('test getSuggestionForInvalidEmail returns empty for totally different domain', () => {
      const output = getSuggestionForInvalidEmail('invalid-domain', 'username');
      expect(output).toEqual('');
    });
  });
});
