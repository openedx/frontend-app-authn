import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import {
  PENDING_STATE,
} from '../../data/constants';
import {
  clearUsernameSuggestions,
  registerNewUser,
} from '../data/actions';
import {
  FIELDS,
} from '../data/constants';
import EmbeddableRegistrationPage from '../EmbeddableRegistrationPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

const IntlEmbedableRegistrationForm = injectIntl(EmbeddableRegistrationPage);
const mockStore = configureStore();

describe('RegistrationPage', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME,
  });

  let props = {};
  let store = {};
  const registrationFormData = {
    configurableFormFields: {
      marketingEmailsOptIn: true,
    },
    formFields: {
      name: '', email: '', username: '', password: '',
    },
    emailSuggestion: {
      suggestion: '', type: '',
    },
    errors: {
      name: '', email: '', username: '', password: '',
    },
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: {},
      registrationFormData,
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    window.parent.postMessage = jest.fn();
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
    props = {
      registrationResult: jest.fn(),
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (registrationPage, payload, isThirdPartyAuth = false) => {
    registrationPage.find('input#name').simulate('change', { target: { value: payload.name, name: 'name' } });
    registrationPage.find('input#username').simulate('change', { target: { value: payload.username, name: 'username' } });
    registrationPage.find('input#email').simulate('change', { target: { value: payload.email, name: 'email' } });

    registrationPage.find('input[name="country"]').simulate('change', { target: { value: payload.country, name: 'country' } });
    registrationPage.find('input[name="country"]').simulate('blur', { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      registrationPage.find('input#password').simulate('change', { target: { value: payload.password, name: 'password' } });
    }
  };

  describe('Test Registration Page', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });

    const emptyFieldValidation = {
      name: 'Enter your full name',
      username: 'Username must be between 2 and 30 characters',
      email: 'Enter your email',
      password: 'Password criteria has not been met',
      country: 'Select your country or region of residence',
    };

    // ******** test registration form submission ********

    it('should submit form for valid input', () => {
      getLocale.mockImplementation(() => ('en-us'));
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      delete window.location;
      window.location = { href: getConfig().BASE_URL, search: '?next=/course/demo-course-url' };

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        next: '/course/demo-course-url',
      };

      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });

    it('should submit form with marketing email opt in value', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@gmail.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should not dispatch registerNewUser on empty form Submission', () => {
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser({}));
    });

    // // ******** test registration form validations ********

    it('should show error messages for required fields on empty form submission', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);

      const alertBanner = 'We couldn\'t create your account.Please check your responses and try again.';
      expect(registrationPage.find('#validation-errors').first().text()).toEqual(alertBanner);
    });

    it('should run validations for focused field on form submission', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input[name="country"]').simulate('focus');
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
    });

    it('should update props with validations returned by registration api', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: 'It looks like this username is already taken' }],
            email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />)).find('EmbeddableRegistrationPage');
      expect(registrationPage.prop('backendValidations')).toEqual({
        email: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account`,
        username: 'It looks like this username is already taken',
      });
    });

    it('should remove space from the start of username', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#username').simulate('change', { target: { value: ' test-user', name: 'username' } });

      expect(registrationPage.find('input#username').prop('value')).toEqual('test-user');
    });
    it('should run username and email frontend validations', () => {
      const payload = {
        name: 'John Doe',
        username: 'test@2u.com',
        email: 'test@yopmail.test',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('input[name="email"]').simulate('focus');
      registrationPage.find('input[name="email"]').simulate('blur', { target: { value: 'test@yopmail.test', name: 'email' } });
      expect(registrationPage.find('.email-suggestion__text').exists()).toBeTruthy();

      registrationPage.find('input[name="email"]').simulate('focus');
      registrationPage.find('input[name="email"]').simulate('blur', { target: { value: 'asasasasas', name: 'email' } });

      registrationPage.find('button.btn-brand').simulate('click');
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeTruthy();
      expect(registrationPage.find('div[feedback-for="username"]').exists()).toBeTruthy();
    });
    it('should run email frontend validations when random string is input', () => {
      const payload = {
        name: 'John Doe',
        username: 'testh@2u.com',
        email: 'as',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);

      registrationPage.find('button.btn-brand').simulate('click');
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeTruthy();
    });
    it('should run frontend validations for name field', () => {
      const payload = {
        name: 'https://localhost.com',
        username: 'test@2u.com',
        email: 'as',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);

      registrationPage.find('button.btn-brand').simulate('click');
      expect(registrationPage.find('div[feedback-for="name"]').exists()).toBeTruthy();
    });

    it('should run frontend validations for password field', () => {
      const payload = {
        name: 'https://localhost.com',
        username: 'test@2u.com',
        email: 'as',
        password: 'as',
        country: 'Pakistan',
        honor_code: true,
        totalRegistrationTime: 0,
        marketing_emails_opt_in: true,
      };

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      populateRequiredFields(registrationPage, payload);

      registrationPage.find('button.btn-brand').simulate('click');
      expect(registrationPage.find('div[feedback-for="password"]').exists()).toBeTruthy();
    });

    it('should click on email suggestion in case suggestion is avialable', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input[name="email"]').simulate('focus');
      registrationPage.find('input[name="email"]').simulate('blur', { target: { value: 'test@gmail.co', name: 'email' } });

      registrationPage.find('a.email-suggestion-alert-warning').simulate('click');
      expect(registrationPage.find('input#email').prop('value')).toEqual('test@gmail.com');
    });

    it('should remove extra character if username is more than 30 character long', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#username').simulate('change', { target: { value: 'why_this_is_not_valid_username_', name: 'username' } });

      expect(registrationPage.find('input#username').prop('value')).toEqual('');
    });

    // // ******** test field focus in functionality ********

    it('should clear field related error messages on input field Focus', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      registrationPage.find('input#name').simulate('focus');
      expect(registrationPage.find('div[feedback-for="name"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      registrationPage.find('input#username').simulate('focus');
      expect(registrationPage.find('div[feedback-for="username"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      registrationPage.find('input#email').simulate('focus');
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      registrationPage.find('input#password').simulate('focus');
      expect(registrationPage.find('div[feedback-for="password"]').exists()).toBeFalsy();

      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);
      registrationPage.find('input[name="country"]').simulate('focus');
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });

    it('should clear username suggestions when username field is focused in', () => {
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#username').simulate('focus');

      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    it('should call backend api for username suggestions when input the name field', () => {
      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));

      registrationPage.find('input#name').simulate('focus');
      registrationPage.find('input#name').simulate('change', { target: { value: 'ahtesham', name: 'name' } });
      registrationPage.find('input#name').simulate('blur');

      expect(store.dispatch).toHaveBeenCalledTimes(4);
    });

    // // ******** test form buttons and fields ********

    it('should match default button state', () => {
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('button[type="submit"] span').first().text())
        .toEqual('Create an account for free');
    });

    it('should match pending button state', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          submitState: PENDING_STATE,
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      const button = registrationPage.find('button[type="submit"] span').first();

      expect(button.find('.sr-only').text()).toEqual('pending');
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('div.form-field--checkbox').length).toEqual(1);

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should show button label based on cta query params value', () => {
      const buttonLabel = 'Register';
      delete window.location;
      window.location = { href: getConfig().BASE_URL, search: `?cta=${buttonLabel}` };
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('button[type="submit"] span').first().text()).toEqual(buttonLabel);
    });

    it('should check registration conversion cookie', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
      });

      renderer.create(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(document.cookie).toMatch(`${getConfig().REGISTER_CONVERSION_COOKIE_NAME}=true`);
    });

    it('should show username suggestions in case of conflict with an existing username', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            errors: {
              ...registrationFormData.errors,
              username: 'It looks like this username is already taken',
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('button.username-suggestions--chip').length).toEqual(3);
    });

    it('should show username suggestions when full name is populated', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });

      expect(registrationPage.find('button.username-suggestions--chip').length).toEqual(3);
    });

    it('should remove empty space from username field when it is focused', async () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registrationPage.find('input#username').simulate('focus');
      await act(async () => { await expect(registrationPage.find('input#username').text()).toEqual(''); });
    });

    it('should click on username suggestions when full name is populated', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registrationPage.find('.username-suggestions--chip').first().simulate('click');
      expect(registrationPage.find('input#username').props().value).toEqual('test_1');
    });

    it('should clear username suggestions when close icon is clicked', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          usernameSuggestions: ['test_1', 'test_12', 'test_123'],
          registrationFormData: {
            ...registrationFormData,
            username: ' ',
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#name').simulate('change', { target: { value: 'test name', name: 'name' } });
      registrationPage.find('button.username-suggestions__close__button').at(0).simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(clearUsernameSuggestions());
    });

    // // ******** miscellaneous tests ********

    it('should send page event when register page is rendered', () => {
      mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
    });

    it('should update state from country code present in redux store', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('input[name="country"]').props().value).toEqual('Pakistan');
    });

    it('should set country in component state when form is translated used i18n', () => {
      getLocale.mockImplementation(() => ('ar-ae'));

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input[name="country"]').simulate('click');
      registrationPage.find('button.dropdown-item').at(0).simulate('click', { target: { value: 'أفغانستان ', name: 'countryItem' } });
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });

    it('should clear the registation validation error on change event on field focused', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            errorCode: 'duplicate-email',
            email: [{ userMessage: `This email is already associated with an existing or previous ${ getConfig().SITE_NAME } account` }],
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);
      const clearBackendError = jest.fn();
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} {...clearBackendError} />));
      registrationPage.find('input#email').simulate('change', { target: { value: 'a@gmail.com', name: 'email' } });
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeFalsy();
    });
  });

  describe('Test Configurable Fields', () => {
    mergeConfig({
      ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });

    it('should render fields returned by backend', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: { name: 'profession', type: 'text', label: 'Profession' },
            terms_of_service: {
              name: FIELDS.TERMS_OF_SERVICE,
              error_message: 'You must agree to the Terms and Service agreement of our site',
            },
          },
        },
      });
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      expect(registrationPage.find('#profession').exists()).toBeTruthy();
      expect(registrationPage.find('#tos').exists()).toBeTruthy();
    });

    it('should submit form with fields returned by backend in payload', () => {
      getLocale.mockImplementation(() => ('en-us'));
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: { name: 'profession', type: 'text', label: 'Profession' },
          },
          extendedProfile: ['profession'],
        },
      });

      const payload = {
        name: 'John Doe',
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'password1',
        country: 'Pakistan',
        honor_code: true,
        profession: 'Engineer',
        totalRegistrationTime: 0,
      };

      store.dispatch = jest.fn(store.dispatch);
      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));

      populateRequiredFields(registrationPage, payload);
      registrationPage.find('input#profession').simulate('change', { target: { value: 'Engineer', name: 'profession' } });
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));
    });

    it('should show error messages for required fields on empty form submission', () => {
      const professionError = 'Enter your profession';
      const countryError = 'Select your country or region of residence';
      const confirmEmailError = 'Enter your email';

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: {
              name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
            },
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email', error_message: confirmEmailError,
            },
            country: { name: 'country' },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(countryError);
      expect(registrationPage.find('#confirm_email-error').last().text()).toEqual(confirmEmailError);
    });

    it('should run validations for configurable focused field on form submission', () => {
      const professionError = 'Enter your profession';
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            profession: {
              name: 'profession', type: 'text', label: 'Profession', error_message: professionError,
            },
          },
        },
      });

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input#profession').simulate('focus', { target: { value: '', name: 'profession' } });
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
    });

    it('should not run country field validation when onBlur is fired by drop-down arrow icon click', () => {
      getLocale.mockImplementation(() => ('en-us'));

      const registrationPage = mount(reduxWrapper(<IntlEmbedableRegistrationForm {...props} />));
      registrationPage.find('input[name="country"]').simulate('blur', {
        target: { value: '', name: 'country' },
        relatedTarget: { type: 'button', className: 'btn-icon pgn__form-autosuggest__icon-button' },
      });
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });
  });
});
