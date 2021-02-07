import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import { getConfig } from '@edx/frontend-platform';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import * as analytics from '@edx/frontend-platform/analytics';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import LoginPage from '../LoginPage';
import { RenderInstitutionButton } from '../../common-components';
import { PENDING_STATE } from '../../data/constants';

import LoginFailureMessage from '../LoginFailure';

const IntlLoginFailureMessage = injectIntl(LoginFailureMessage);

jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();

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
    window.location = { href: getConfig().BASE_URL.concat('/login?account_activation_status=info') };

    const expectedMessage = 'This account has already been activated.';

    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(loginPage.find('#account-activation-message').find('div').text()).toEqual(expectedMessage);
  });

  it('should display login help button', () => {
    const root = mount(reduxWrapper(<IntlLoginPage {...props} />));
    expect(root.find('button.field-link').first().text()).toEqual('Need help signing in?');
  });

  it('updates the error state for invalid email', () => {
    const errorState = { email: null, password: '' };
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#password').simulate('change', { target: { value: 'test', name: 'password' } });
    loginPage.find('button.btn-brand').simulate('click');

    expect(loginPage.find('LoginPage').state('errors')).toEqual(errorState);
  });

  it('updates the error state for invalid password', () => {
    const errorState = { email: '', password: null };
    const loginPage = mount(reduxWrapper(<IntlLoginPage {...props} />));

    loginPage.find('input#email').simulate('change', { target: { value: 'test@example.com', name: 'email' } });
    loginPage.find('button.btn-brand').simulate('click');
    expect(loginPage.find('LoginPage').state('errors')).toEqual(errorState);
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
});
