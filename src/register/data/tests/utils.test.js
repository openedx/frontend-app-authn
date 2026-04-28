import { isFormValid, normalizeErrorMessage } from '../utils';

describe('normalizeErrorMessage', () => {
  it('should return the error message if it is a string', () => {
    const errorMessage = 'This field is required';
    expect(normalizeErrorMessage(errorMessage)).toBe('This field is required');
  });

  it('should extract the first value from an object error message', () => {
    const errorMessage = { required: 'This field is required' };
    expect(normalizeErrorMessage(errorMessage)).toBe('This field is required');
  });

  it('should handle multiple keys in object and return first value', () => {
    const errorMessage = { required: 'Required field', min_length: 'Too short' };
    const result = normalizeErrorMessage(errorMessage);
    expect(['Required field', 'Too short']).toContain(result);
  });

  it('should return empty string if error message is null', () => {
    expect(normalizeErrorMessage(null)).toBe('');
  });

  it('should return empty string if error message is undefined', () => {
    expect(normalizeErrorMessage(undefined)).toBe('');
  });

  it('should return empty string if error message is an empty object', () => {
    expect(normalizeErrorMessage({})).toBe('');
  });

  it('should return empty string if error message is an empty string', () => {
    expect(normalizeErrorMessage('')).toBe('');
  });
});

describe('Payload validation', () => {
  let formatMessage;
  let configurableFormFields;
  let fieldDescriptions;

  beforeEach(() => {
    formatMessage = jest.fn(msg => msg);
    configurableFormFields = {
      confirm_email: true,
    };
    fieldDescriptions = {};
  });

  test('validates name field correctly', () => {
    const payload = { name: ' ' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates email field correctly', () => {
    const payload = { email: 'invalid-email' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.email).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates username field correctly', () => {
    const payload = { username: 'invalid username' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.username).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates password field correctly', () => {
    const payload = { password: 'short' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates multiple fields correctly', () => {
    const payload = {
      name: 'InvalidName!',
      email: 'invalid-email',
      username: 'invalid username',
      password: 'short',
    };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(fieldErrors.email).toBeDefined();
    expect(fieldErrors.username).toBeDefined();
    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });
});
