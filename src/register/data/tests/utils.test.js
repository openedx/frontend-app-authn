import { isFormValid } from '../utils';

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
