import React from 'react';
import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import {
  getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { registerNewUser } from '../../data/actions';
import { FIELDS } from '../../data/constants';
import RegistrationPage from '../../RegistrationPage';
import ConfigurableRegistrationForm from '../ConfigurableRegistrationForm';

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
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
    getLocale.mockImplementationOnce(() => ('en-us'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const populateRequiredFields = (getByLabelText, payload, isThirdPartyAuth = false) => {
    fireEvent.change(getByLabelText('Full name'), { target: { value: payload.name, name: 'name' } });
    fireEvent.change(getByLabelText('Public username'), { target: { value: payload.username, name: 'username' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: payload.email, name: 'email' } });

    fireEvent.change(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });
    fireEvent.blur(getByLabelText('Country/Region'), { target: { value: payload.country, name: 'country' } });

    if (!isThirdPartyAuth) {
      fireEvent.change(getByLabelText('Password'), { target: { value: payload.password, name: 'password' } });
    }
  };

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

      render(routerWrapper(reduxWrapper(
        <IntlConfigurableRegistrationForm {...props} />,
      )));

      expect(document.querySelector('#profession')).toBeTruthy();
      expect(document.querySelector('#tos')).toBeTruthy();
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

      render(routerWrapper(reduxWrapper(
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
      render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(document.querySelector('#profession')).toBeTruthy();
      expect(document.querySelector('#tos')).toBeTruthy();
    });

    it('should submit form with fields returned by backend in payload', () => {
      mergeConfig({
        SHOW_CONFIGURABLE_EDX_FIELDS: true,
      });
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
        total_registration_time: 0,
      };

      store.dispatch = jest.fn(store.dispatch);
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      populateRequiredFields(getByLabelText, payload);

      const professionInput = getByLabelText('Profession');
      fireEvent.change(professionInput, { target: { value: 'Engineer', name: 'profession' } });

      const submitButton = container.querySelector('button.btn-brand');

      fireEvent.click(submitButton);

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

      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const submitButton = container.querySelector('button.btn-brand');

      fireEvent.click(submitButton);

      const professionErrorElement = container.querySelector('#profession-error');
      const countryErrorElement = container.querySelector('div[feedback-for="country"]');
      const confirmEmailErrorElement = container.querySelector('#confirm_email-error');

      expect(professionErrorElement.textContent).toEqual(professionError);
      expect(countryErrorElement.textContent).toEqual(countryError);
      expect(confirmEmailErrorElement.textContent).toEqual(confirmEmailError);
    });

    it('should show country field validation when country name is invalid', () => {
      const invalidCountryError = 'Country must match with an option available in the dropdown.';

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            country: { name: 'country' },
          },
        },
      });
      const { container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      const countryInput = container.querySelector('input[name="country"]');
      fireEvent.change(countryInput, { target: { value: 'Pak', name: 'country' } });
      fireEvent.blur(countryInput, { target: { value: 'Pak', name: 'country' } });

      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const countryErrorElement = container.querySelector('div[feedback-for="country"]');

      expect(countryErrorElement.textContent).toEqual(invalidCountryError);
    });

    it('should show error if email and confirm email fields do not match', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          fieldDescriptions: {
            confirm_email: {
              name: 'confirm_email', type: 'text', label: 'Confirm Email',
            },
          },
        },
      });
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      const emailInput = getByLabelText('Email');
      const confirmEmailInput = getByLabelText('Confirm Email');

      fireEvent.change(emailInput, { target: { value: 'test1@gmail.com', name: 'email' } });
      fireEvent.blur(confirmEmailInput, { target: { value: 'test2@gmail.com', name: 'confirm_email' } });

      const confirmEmailErrorElement = container.querySelector('div#confirm_email-error');

      expect(confirmEmailErrorElement.textContent).toEqual('The email addresses do not match.');
    });

    it('should show error if email and confirm email fields do not match on submit click', () => {
      const formPayload = {
        name: 'Petro',
        username: 'petro_qa',
        email: 'petro@example.com',
        password: 'password1',
        country: 'Ukraine',
        honor_code: true,
        total_registration_time: 0,
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
      const { getByLabelText, container } = render(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      populateRequiredFields(getByLabelText, formPayload, true);
      fireEvent.change(
        getByLabelText('Confirm Email'),
        { target: { value: 'test2@gmail.com', name: 'confirm_email' } },
      );

      const button = container.querySelector('button.btn-brand');
      fireEvent.click(button);

      const confirmEmailErrorElement = container.querySelector('div#confirm_email-error');
      expect(confirmEmailErrorElement.textContent).toEqual('The email addresses do not match.');

      const validationErrors = container.querySelector('#validation-errors');
      expect(validationErrors.textContent).toContain(
        "We couldn't create your account.Please check your responses and try again.",
      );
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

      const { getByLabelText, container } = render(
        routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)),
      );

      const professionInput = getByLabelText('Profession');
      fireEvent.focus(professionInput);

      const submitButton = container.querySelector('button.btn-brand');
      fireEvent.click(submitButton);

      const professionErrorElement = container.querySelector('#profession-error');

      expect(professionErrorElement.textContent).toEqual(professionError);
    });
  });
});
