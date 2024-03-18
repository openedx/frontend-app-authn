import React from 'react';
import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import {
  getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import ConfigurableRegistrationForm from './ConfigurableRegistrationForm';
import { FIELDS } from '../data/constants';
import RegistrationPage from '../RegistrationPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

const IntlConfigurableRegistrationForm = injectIntl(ConfigurableRegistrationForm);
const IntlRegistrationPage = injectIntl(RegistrationPage);
const mockStore = configureStore();
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

describe('ConfigurableRegistrationForm', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
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
    props = {
      email: '',
      fieldDescriptions: {},
      fieldErrors: {},
      formFields: {},
      setFieldErrors: jest.fn(),
      setFormFields: jest.fn(),
      registrationEmbedded: false,
      autoSubmitRegistrationForm: false,
    };
    window.location = { search: '' };
    getLocale.mockImplementationOnce(() => ('en-us'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Test Configurable Fields', () => {
    mergeConfig({
      ENABLE_DYNAMIC_REGISTRATION_FIELDS: true,
    });

    it('should render fields returned by backend as field descriptions', () => {
      props = {
        ...props,
        fieldDescriptions: {
          profession: { name: 'profession', type: 'text', label: 'Profession' },
          terms_of_service: {
            name: FIELDS.TERMS_OF_SERVICE,
            error_message: 'You must agree to the Terms and Service agreement of our site',
          },
        },
      };

      const configurableRegistrationForm = mount(routerWrapper(reduxWrapper(
        <IntlConfigurableRegistrationForm {...props} />,
      )));

      expect(configurableRegistrationForm.find('#profession').exists()).toBeTruthy();
      expect(configurableRegistrationForm.find('#tos').exists()).toBeTruthy();
    });

    it('should check TOS and honor code fields if they exist when auto submitting register form', () => {
      props = {
        ...props,
        formFields: {
          country: {
            countryCode: '',
            displayValue: '',
          },
        },
        fieldDescriptions: {
          terms_of_service: {
            name: FIELDS.TERMS_OF_SERVICE,
            error_message: 'You must agree to the Terms and Service agreement of our site',
          },
          honor_code: {
            name: FIELDS.HONOR_CODE,
            error_message: 'You must agree to the Honor Code agreement of our site',
          },
        },
        autoSubmitRegistrationForm: true,
      };

      mount(routerWrapper(reduxWrapper(
        <IntlConfigurableRegistrationForm {...props} />,
      )));

      expect(props.setFormFields).toHaveBeenCalledTimes(2);
      expect(props.setFormFields.mock.calls[0][0]()).toEqual({
        [FIELDS.HONOR_CODE]: true,
      });

      expect(props.setFormFields.mock.calls[1][0]()).toEqual({
        [FIELDS.TERMS_OF_SERVICE]: true,
      });
    });

    it('should show error if email and confirm email fields do not match on submit click', () => {
      const formPayload = {
        name: 'Petro',
        username: 'petro_qa',
        email: 'petro@example.com',
        password: 'password1',
        country: 'Ukraine',
        honor_code: true,
        totalRegistrationTime: 0,
      };

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email',
            },
            country: { name: 'country' },
          },
        },
      });
      const registrationPage = mount(routerWrapper(reduxWrapper(
        <IntlRegistrationPage {...props} />,
      )));

      populateRequiredFields(registrationPage, formPayload, true);
      registrationPage.find('input#confirm_email').simulate(
        'change', { target: { value: 'test2@gmail.com', name: 'confirm_email' } },
      );

      const button = registrationPage.find('button.btn-brand');
      button.simulate('click');

      registrationPage.update();

      const confirmEmailErrorElement = registrationPage.find('div#confirm_email-error');
      expect(confirmEmailErrorElement.text()).toEqual('The email addresses do not match.');

      const validationErrors = registrationPage.find('#validation-errors');
      const firstValidationErrorText = validationErrors.first().text();
      expect(firstValidationErrorText).toContain(
        "We couldn't create your account.Please check your responses and try again.",
      );
    });
  });
});
