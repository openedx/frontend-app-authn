import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import {
  AUTHN_PROGRESSIVE_PROFILING, PENDING_STATE, REGISTER_PAGE,
} from '../../../data/constants';
import {
  clearRegistrationBackendError,
  registerNewUser,
} from '../../data/actions';
import {
  FIELDS,
  FORBIDDEN_REQUEST,
  INTERNAL_SERVER_ERROR,
  TPA_AUTHENTICATION_FAILURE,
  TPA_SESSION_EXPIRED,
} from '../../data/constants';
import { EmbeddableRegistrationPage } from '../../index';
import RegistrationFailureMessage from '../RegistrationFailure';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

const IntlEmbeddableRegistrationPage = injectIntl(EmbeddableRegistrationPage);
const IntlRegistrationFailure = injectIntl(RegistrationFailureMessage);
const mockStore = configureStore();

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('EmbeddableRegistrationPage', () => {
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

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const thirdPartyAuthContext = {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
    countryCode: null,
  };

  const initialState = {
    register: {
      registrationResult: { success: false, redirectUrl: '' },
      registrationError: {},
      registrationFormData,
      usernameSuggestions: [],
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext,
      fieldDescriptions: {},
      optionalFields: {
        fields: {},
        extended_profile: [],
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });

    props = {};

    window.location = { search: '' };
    window.parent.postMessage = jest.fn();

    getLocale.mockImplementation(() => ('en-us'));
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

  describe('Test Embeddable Registration Page', () => {
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
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
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
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      populateRequiredFields(registrationPage, payload);
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).toHaveBeenCalledWith(registerNewUser({ ...payload, country: 'PK' }));

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should not dispatch registerNewUser on empty form Submission', () => {
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('button.btn-brand').simulate('click');
      expect(store.dispatch).not.toHaveBeenCalledWith(registerNewUser({}));
    });

    // ******** test registration form validations ********

    it('should show error messages for required fields on empty form submission', () => {
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="name"]').text()).toEqual(emptyFieldValidation.name);
      expect(registrationPage.find('div[feedback-for="username"]').text()).toEqual(emptyFieldValidation.username);
      expect(registrationPage.find('div[feedback-for="email"]').text()).toEqual(emptyFieldValidation.email);
      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(emptyFieldValidation.country);

      const alertBanner = 'We couldn\'t create your account.Please check your responses and try again.';
      expect(registrationPage.find('#validation-errors').first().text()).toEqual(alertBanner);
    });

    it('should clear error on focus', () => {
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);

      registrationPage.find('input#password').simulate('focus');
      expect(registrationPage.find('div[feedback-for="password"]').exists()).toBeFalsy();
    });

    it('should clear registration backend error on change', () => {
      getLocale.mockImplementation(() => ('en-us'));
      const emailError = 'This email is already associated with an existing or previous account';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            email: [{ userMessage: emailError }],
          },
        },
      });
      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(routerWrapper(reduxWrapper(
        <IntlEmbeddableRegistrationPage {...props} />,
      ))).find('EmbeddableRegistrationPage');

      registrationPage.find('input#email').simulate('change', { target: { value: 'test1@gmail.com', name: 'email' } });
      expect(store.dispatch).toHaveBeenCalledWith(clearRegistrationBackendError('email'));
    });

    // ******** test alert messages ********

    it('should match internal server error message', () => {
      const expectedMessage = 'We couldn\'t create your account.An error has occurred. Try refreshing the page, or check your internet connection.';
      props = {
        errorCode: INTERNAL_SERVER_ERROR,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
    });

    it('should match registration api rate limit error message', () => {
      const expectedMessage = 'We couldn\'t create your account.Too many failed registration attempts. Try again later.';
      props = {
        errorCode: FORBIDDEN_REQUEST,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
    });

    it('should match tpa session expired error message', () => {
      const expectedMessage = 'We couldn\'t create your account.Registration using Google has timed out.';
      props = {
        context: {
          provider: 'Google',
        },
        errorCode: TPA_SESSION_EXPIRED,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toEqual(expectedMessage);
    });

    it('should match tpa authentication failed error message', () => {
      const expectedMessageSubstring = 'We are sorry, you are not authorized to access';
      props = {
        context: {
          provider: 'Google',
        },
        errorCode: TPA_AUTHENTICATION_FAILURE,
        failureCount: 0,
      };

      const registrationPage = mount(reduxWrapper(<IntlRegistrationFailure {...props} />));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toContain(expectedMessageSubstring);
    });

    // ******** test form buttons and fields ********

    it('should match default button state', () => {
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      expect(registrationPage.find('button[type="submit"] span').first().text()).toEqual('Create an account for free');
    });

    it('should match pending button state', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          submitState: PENDING_STATE,
        },
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      const button = registrationPage.find('button[type="submit"] span').first();

      expect(button.find('.sr-only').text()).toEqual('pending');
    });

    it('should display opt-in/opt-out checkbox', () => {
      mergeConfig({
        MARKETING_EMAILS_OPT_IN: 'true',
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      expect(registrationPage.find('div.form-field--checkbox').length).toEqual(1);

      mergeConfig({
        MARKETING_EMAILS_OPT_IN: '',
      });
    });

    it('should show button label based on cta query params value', () => {
      const buttonLabel = 'Register';
      delete window.location;
      window.location = { href: getConfig().BASE_URL, search: `?cta=${buttonLabel}` };
      const registrationPage = mount(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />));
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

      renderer.create(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      expect(document.cookie).toMatch(`${getConfig().REGISTER_CONVERSION_COOKIE_NAME}=true`);
    });

    // ******** miscellaneous tests ********

    it('should send page event when register page is rendered', () => {
      mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
    });

    it('should send track event when user has successfully registered', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
            redirectUrl: 'https://test.com/testing-dashboard/',
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };
      renderer.create(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.account.registered.client', {});
    });

    it('should display error message based on the error code returned by API', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            errorCode: INTERNAL_SERVER_ERROR,
          },
        },
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />))).find('EmbeddableRegistrationPage');
      expect(registrationPage.find('div#validation-errors').first().text()).toContain(
        'An error has occurred. Try refreshing the page, or check your internet connection.',
      );
    });

    it('should call the postMessage API on registration success for embedded experience', () => {
      mergeConfig({
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: true,
      });

      window.parent.postMessage = jest.fn();

      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: '?host=http://localhost/host-website',
      };

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationResult: {
            success: true,
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          optionalFields: {
            extended_profile: [],
            fields: {
              level_of_education: { name: 'level_of_education', error_message: false },
            },
          },
        },
      });
      const progressiveProfilingPage = mount(reduxWrapper(
        <IntlEmbeddableRegistrationPage {...props} />,
      ));
      progressiveProfilingPage.update();
      expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
    });

    it('should not display validations error on blur event when embedded variant is rendered', () => {
      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };
      const registrationPage = mount(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />));

      registrationPage.find('input#username').simulate('blur', { target: { value: '', name: 'username' } });
      expect(registrationPage.find('div[feedback-for="username"]').exists()).toBeFalsy();

      registrationPage.find('input[name="country"]').simulate('blur', { target: { value: '', name: 'country' } });
      expect(registrationPage.find('div[feedback-for="country"]').exists()).toBeFalsy();
    });

    it('should set errors in temporary state when validations are returned by registration api', () => {
      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: '?host=http://localhost/host-website' };

      const usernameError = 'It looks like this username is already taken';
      const emailError = 'This email is already associated with an existing or previous account';
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationError: {
            username: [{ userMessage: usernameError }],
            email: [{ userMessage: emailError }],
          },
        },
      });
      const registrationPage = mount(routerWrapper(reduxWrapper(
        <IntlEmbeddableRegistrationPage {...props} />),
      )).find('EmbeddableRegistrationPage');

      expect(registrationPage.find('div[feedback-for="username"]').exists()).toBeFalsy();
      expect(registrationPage.find('div[feedback-for="email"]').exists()).toBeFalsy();
    });

    it('should clear error on focus for embedded experience also', () => {
      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(REGISTER_PAGE),
        search: '?host=http://localhost/host-website',
      };

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('div[feedback-for="password"]').text()).toContain(emptyFieldValidation.password);

      registrationPage.find('input#password').simulate('focus');
      expect(registrationPage.find('div[feedback-for="password"]').exists()).toBeFalsy();
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
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
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
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));

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

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
      expect(registrationPage.find('div[feedback-for="country"]').text()).toEqual(countryError);
      expect(registrationPage.find('#confirm_email-error').last().text()).toEqual(confirmEmailError);
    });

    it('should show error if email and confirm email fields do not match', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          registrationFormData: {
            ...initialState.register.registrationFormData,
            configurableFormFields: {
              ...initialState.register.registrationFormData.configurableFormFields,
              confirm_email: 'test2@yopmail.com',
            },
            formFields: {
              ...initialState.register.registrationFormData.formFields,
              email: 'test1@yopmail.com',
            },
          },
        },
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email',
            },
          },
        },
      });
      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('input#confirm_email').simulate('blur');
      registrationPage.find('button.btn-brand').simulate('click');
      expect(registrationPage.find('div#confirm_email-error').text()).toEqual('The email addresses do not match.');
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

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlEmbeddableRegistrationPage {...props} />)));
      registrationPage.find('input#profession').simulate('focus', { target: { value: '', name: 'profession' } });
      registrationPage.find('button.btn-brand').simulate('click');

      expect(registrationPage.find('#profession-error').last().text()).toEqual(professionError);
    });
  });
});
