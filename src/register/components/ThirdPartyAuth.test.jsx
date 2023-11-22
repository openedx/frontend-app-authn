import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import {
  configure, getLocale, injectIntl, IntlProvider,
} from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

import {
  COMPLETE_STATE, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../../data/constants';
import RegistrationPage from '../RegistrationPage';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

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

describe('ThirdPartyAuth', () => {
  mergeConfig({
    PRIVACY_POLICY: 'https://privacy-policy.com',
    TOS_AND_HONOR_CODE: 'https://tos-and-honot-code.com',
    USER_RETENTION_COOKIE_NAME: 'authn-returning-user',
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
    props = {
      handleInstitutionLogin: jest.fn(),
      institutionLogin: false,
    };
    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const ssoProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: 'apple',
    iconImage: 'https://openedx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  describe('Test Third Party Auth', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });
    getLocale.mockImplementation(() => ('en-us'));

    const secondaryProviders = {
      id: 'saml-test', name: 'Test University', loginUrl: '/dummy-auth', registerUrl: '/dummy_auth',
    };

    it('should not display password field when current provider is present', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: ssoProvider.name,
          },
        },
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find('input#password').length).toEqual(0);
    });

    it('should render tpa button for tpa_hint id matching one of the primary providers', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('span').text()).toEqual(ssoProvider.name);
      expect(registrationPage.find(`button#${ssoProvider.id}`).hasClass(`btn-tpa btn-${ssoProvider.id}`)).toEqual(true);
    });

    it('should display skeleton if tpa_hint is true and thirdPartyAuthContext is pending', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: PENDING_STATE,
        },
      });

      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(LOGIN_PAGE),
        search: `?next=/dashboard&tpa_hint=${ssoProvider.id}`,
      };

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find('.react-loading-skeleton').exists()).toBeTruthy();
    });

    it('should render icon if icon classes are missing in providers', () => {
      ssoProvider.iconClass = null;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${ssoProvider.id}` };
      ssoProvider.iconImage = null;

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('div').find('span').hasClass('pgn__icon')).toEqual(true);
    });

    it('should render tpa button for tpa_hint id matching one of the secondary providers', () => {
      secondaryProviders.skipHintedLogin = true;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            secondaryProviders: [secondaryProviders],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };

      mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(window.location.href).toEqual(getConfig().LMS_BASE_URL + secondaryProviders.registerUrl);
    });

    it('should render regular tpa button for invalid tpa_hint value', () => {
      const expectedMessage = `${ssoProvider.name}`;
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
          thirdPartyAuthApiStatus: COMPLETE_STATE,
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL.concat(LOGIN_PAGE), search: '?next=/dashboard&tpa_hint=invalid' };

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find(`button#${ssoProvider.id}`).find('span#provider-name').text()).toEqual(expectedMessage);
    });

    it('should show single sign on provider button', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
        },
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find(`button#${ssoProvider.id}`).length).toEqual(1);
    });

    it('should show single sign on provider button', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [ssoProvider],
          },
        },
      });

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find(`button#${ssoProvider.id}`).length).toEqual(1);
    });

    it('should display InstitutionLogistration if insitutionLogin prop is true', () => {
      props = {
        ...props,
        institutionLogin: true,
      };

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find('.institutions__heading').text()).toEqual('Register with institution/campus credentials');
    });

    it('should redirect to social auth provider url on SSO button click', () => {
      const registerUrl = '/auth/login/apple-id/?auth_entry=register&next=/dashboard';
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            providers: [{
              ...ssoProvider,
              registerUrl,
            }],
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      const loginPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));

      loginPage.find('button#oa2-apple-id').simulate('click');
      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + registerUrl);
    });

    it('should redirect to finishAuthUrl upon successful registration via SSO', () => {
      const authCompleteUrl = '/auth/complete/google-oauth2/';
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
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            finishAuthUrl: authCompleteUrl,
          },
        },
      });

      delete window.location;
      window.location = { href: getConfig().BASE_URL };

      renderer.create(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
    });

    // ******** test alert messages ********

    it('should match third party auth alert', () => {
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: 'Apple',
          },
        },
      });

      const expectedMessage = `${'You\'ve successfully signed into Apple! We just need a little more information before '
                              + 'you start learning with '}${ getConfig().SITE_NAME }.`;

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find('#tpa-alert').find('p').text()).toEqual(expectedMessage);
    });
    it('should display errorMessage if third party authentication fails', () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 0);
      getLocale.mockImplementation(() => ('en-us'));

      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'PK',
          userPipelineDataLoaded: false,
        },
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          thirdPartyAuthContext: {
            ...initialState.commonComponents.thirdPartyAuthContext,
            currentProvider: null,
            pipelineUserDetails: {},
            errorMessage: 'An error occurred',
          },
        },
      });

      store.dispatch = jest.fn(store.dispatch);

      const registrationPage = mount(routerWrapper(reduxWrapper(<IntlRegistrationPage {...props} />)));
      expect(registrationPage.find('div.alert-heading').length).toEqual(1);
      expect(registrationPage.find('div.alert').first().text()).toContain('An error occurred');
    });
  });
});
