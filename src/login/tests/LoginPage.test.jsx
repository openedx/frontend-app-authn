import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';

import LoginFailureMessage from '../LoginFailure';
import LoginPage from '../LoginPage';
import { loginRequest, loginRequestFailure } from '../data/actions';
import { RenderInstitutionButton } from '../../common-components';
import { COMPLETE_STATE, PENDING_STATE } from '../../data/constants';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);
const IntlLoginPage = injectIntl(LoginPage);
const mockStore = configureStore();

describe('LoginPage', () => {
  const initialState = {
    forgotPassword: { status: null },
    login: {
      loginResult: { success: false, redirectUrl: '' },
    },
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        currentProvider: null,
        finishAuthUrl: null,
        providers: [],
        secondaryProviders: [],
      },
    },
  };

  let props = {};
  let store = {};

  const secondaryProviders = {
    id: 'saml-test',
    name: 'Test University',
    loginUrl: '/dummy-auth',
    registerUrl: '/dummy_auth',
  };

  const appleProvider = {
    id: 'oa2-apple-id',
    name: 'Apple',
    iconClass: null,
    iconImage: 'https://edx.devstack.lms/logo.png',
    loginUrl: '/auth/login/apple-id/?auth_entry=login&next=/dashboard',
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore(initialState);
    props = {
      loginRequest: jest.fn(),
    };
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match pending button state snapshot', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        submitState: PENDING_STATE,
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match forget password alert message snapshot', () => {
    store = mockStore({
      ...initialState,
      forgotPassword: { status: 'complete', email: 'test@example.com' },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match TPA provider snapshot', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should show error message', () => {
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginError: { value: 'Email or password is incorrect.' },
      },
    });

    const tree = renderer.create(reduxWrapper(<IntlLoginPage {...props} />)).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should show account activation message', () => {
    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: '?account_activation_status=info' };

    const expectedMessage = 'This account has already been activated.';

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#account-activation-message').find('div').text()).toEqual(expectedMessage);
  });

  it('should display login help button', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.find('button.field-link').first().text()).toEqual('Need help signing in?');
  });

  it('updates the error state for empty email input on form submission', () => {
    const errorState = { email: 'Please enter your email.', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.state('errors')).toEqual(errorState);
    expect(store.dispatch).toHaveBeenCalledWith(
      loginRequestFailure({ errorCode: 'invalid-form', context: errorState }),
    );
  });

  it('updates the error state for invalid email; less than 3 characters on form submission', () => {
    const errorState = { email: 'Email must have at least 3 characters.', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('input#email').simulate('change', { target: { value: 'te', name: 'email' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.state('errors')).toEqual(errorState);
    expect(store.dispatch).toHaveBeenCalledWith(
      loginRequestFailure({ errorCode: 'invalid-form', context: errorState }),
    );
  });

  it('updates the error state for invalid email format validation on form submission', () => {
    const errorState = { email: 'The email address you\'ve provided isn\'t formatted correctly.', password: '' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('input#email').simulate('change', { target: { value: 'test@', name: 'email' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.state('errors')).toEqual(errorState);
  });

  it('updates the error state for invalid password', () => {
    const errorState = { email: '', password: 'Please enter your password.' };
    store.dispatch = jest.fn(store.dispatch);

    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');

    loginPage.find('input#email').simulate('change', { target: { value: 'test@example.com', name: 'email' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.state('errors')).toEqual(errorState);
    expect(store.dispatch).toHaveBeenCalledWith(
      loginRequestFailure({ errorCode: 'invalid-form', context: errorState }),
    );
  });

  it('submits login request for valid email and password values', () => {
    store.dispatch = jest.fn(store.dispatch);
    const loginPage = (mount(reduxWrapper(<IntlLoginPage {...props} />))).find('LoginPage');
    loginPage.find('input#email').simulate('change', { target: { value: 'test@example.com' } });
    loginPage.find('input#password').simulate('change', { target: { value: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith(
      loginRequest({ email: 'test@example.com', password: 'password' }),
    );
  });

  it('should match url after redirection', () => {
    const dasboardUrl = 'http://test.com/testing-dashboard/';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: dasboardUrl,
        },
      },
    });
    delete window.location;
    window.location = { href: getConfig().BASE_URL };
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(dasboardUrl);
  });

  it('should match url after TPA redirection', () => {
    const authCompleteUrl = '/auth/complete/google-oauth2/';
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: '',
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
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + authCompleteUrl);
  });

  it('should redirect to enterprise selection page', () => {
    const authCompleteUrl = '/auth/complete/google-oauth2/';
    const enterpriseSelectionPage = 'http://localhost:18000/enterprise/select/active/?success_url='.concat(authCompleteUrl);
    store = mockStore({
      ...initialState,
      login: {
        ...initialState.login,
        loginResult: {
          success: true,
          redirectUrl: enterpriseSelectionPage,
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
    renderer.create(reduxWrapper(<IntlLoginPage {...props} />));
    expect(window.location.href).toBe(enterpriseSelectionPage);
  });

  it('should redirect to social auth provider url', () => {
    const loginUrl = '/auth/login/apple-id/?auth_entry=login&next=/dashboard';
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [{
            ...appleProvider,
            loginUrl,
          }],
        },
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('button#oa2-apple-id').simulate('click');
    expect(window.location.href).toBe(getConfig().LMS_BASE_URL + loginUrl);
  });

  it('should match third party auth alert', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          currentProvider: 'Apple',
          platformName: 'edX',
        },
      },
    });

    const expectedMessage = 'You have successfully signed into Apple, but your Apple account does not have a '
                            + 'linked edX account. To link your accounts, sign in now using your edX password.';

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#tpa-alert').find('span').text()).toEqual(expectedMessage);
  });

  it('should display institution login button', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          secondaryProviders: [secondaryProviders],
        },
      },
    });
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.text().includes('Use my university info')).toBe(true);
  });

  it('should not display institution login button', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.text().includes('Use my university info')).toBe(false);
  });

  it('should display institution login page', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          secondaryProviders: [secondaryProviders],
        },
      },
    });
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(loginPage.text().includes('Test University')).toBe(true);
  });

  it('send tracking event when create account link is clicked', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('a[href*="/register"]').simulate('click');
    loginPage.update();
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.register_form.toggled', { category: 'user-engagement' });
  });

  it('send page event when login page is rendered', () => {
    mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('send tracking and page events when institutional button is clicked', () => {
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          secondaryProviders: [secondaryProviders],
        },
      },
    });
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    loginPage.find(RenderInstitutionButton).simulate('click', { institutionLogin: true });
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'institution_login');
  });

  it('check cookie rendered', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('form only be scrollable on submission', () => {
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#password').simulate('change', { target: { value: 'test@example.com', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find(<IntlLoginFailureMessage />)).toBeTruthy();
    expect(loginPage.find('LoginPage').state('isSubmitted')).toEqual(true);
  });

  it('should render tpa button for tpa_hint id in primary provider', () => {
    const expectedMessage = `Sign in using ${appleProvider.name}`;
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: `?next=/dashboard&tpa_hint=${appleProvider.id}` };
    appleProvider.iconImage = null;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${appleProvider.id}`).find('span').text()).toEqual(expectedMessage);
  });

  it('should render regular tpa button for invalid tpa_hint value', () => {
    const expectedMessage = `${appleProvider.name}`;
    store = mockStore({
      ...initialState,
      commonComponents: {
        ...initialState.commonComponents,
        thirdPartyAuthContext: {
          ...initialState.commonComponents.thirdPartyAuthContext,
          providers: [appleProvider],
        },
        thirdPartyAuthApiStatus: COMPLETE_STATE,
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: '?next=/dashboard&tpa_hint=invalid' };
    appleProvider.iconImage = null;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${appleProvider.id}`).find('span#provider-name').text()).toEqual(expectedMessage);
  });

  it('should render tpa button for tpa_hint id in secondary provider', () => {
    const expectedMessage = `Sign in using ${secondaryProviders.name}`;
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
    window.location = { href: getConfig().BASE_URL.concat('/login'), search: `?next=/dashboard&tpa_hint=${secondaryProviders.id}` };
    secondaryProviders.iconImage = null;

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find(`button#${secondaryProviders.id}`).find('span').text()).toEqual(expectedMessage);
  });
});
