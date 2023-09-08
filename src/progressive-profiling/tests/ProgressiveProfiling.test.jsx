import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { identifyAuthenticatedUser, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { MemoryRouter, mockNavigate, useLocation } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import {
  AUTHN_PROGRESSIVE_PROFILING,
  COMPLETE_STATE, DEFAULT_REDIRECT_URL,
  EMBEDDED,
  FAILURE_STATE,
  RECOMMENDATIONS,
} from '../../data/constants';
import { saveUserProfile } from '../data/actions';
import ProgressiveProfiling from '../ProgressiveProfiling';

const IntlProgressiveProfilingPage = injectIntl(ProgressiveProfiling);
const mockStore = configureStore();

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  configure: jest.fn(),
  getAuthenticatedUser: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  getLoggingService: jest.fn(),
}));
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
    useLocation: jest.fn(),
  };
});

describe('ProgressiveProfilingTests', () => {
  let store = {};

  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const registrationResult = { redirectUrl: getConfig().LMS_BASE_URL + DEFAULT_REDIRECT_URL, success: true };
  const fields = {
    company: { name: 'company', type: 'text', label: 'Company' },
    gender: {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      options: [['m', 'Male'], ['f', 'Female'], ['o', 'Other/Prefer Not to Say']],
    },
  };
  const extendedProfile = ['company'];
  const optionalFields = { fields, extended_profile: extendedProfile };
  const initialState = {
    welcomePage: {},
    commonComponents: {
      thirdPartyAuthApiStatus: null,
      optionalFields: {},
      thirdPartyAuthContext: {
        welcomePageRedirectUrl: null,
      },
    },
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

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
    useLocation.mockReturnValue({
      state: {
        registrationResult,
        optionalFields,
      },
    });
    getAuthenticatedUser.mockReturnValue({ userId: 3, username: 'abc123' });
  });

  // ******** test form links and modal ********

  it('should not display button "Learn more about how we use this information."', () => {
    mergeConfig({
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: '',
    });
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    expect(progressiveProfilingPage.find('a.pgn__hyperlink').exists()).toBeFalsy();
  });

  it('should display button "Learn more about how we use this information."', () => {
    mergeConfig({
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    expect(progressiveProfilingPage.find('a.pgn__hyperlink').text()).toEqual('Learn more about how we use this information.');
  });

  it('should open modal on pressing skip for now button', () => {
    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING) };
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    progressiveProfilingPage.find('button.btn-link').simulate('click');
    expect(progressiveProfilingPage.find('.pgn__modal-content-container').exists()).toBeTruthy();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked', { host: '' });
  });

  // ******** test event functionality ********

  it('should make identify call to segment on progressive profiling page', () => {
    mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    expect(identifyAuthenticatedUser).toHaveBeenCalledWith(3);
    expect(identifyAuthenticatedUser).toHaveBeenCalled();
  });

  it('should send analytic event for support link click', () => {
    mergeConfig({
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    progressiveProfilingPage.find('.pp-page__support-link a[target="_blank"]').simulate('click');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.support.link.clicked');
  });

  it('should set empty host property value for non-embedded experience', () => {
    const expectedEventProperties = {
      isGenderSelected: false,
      isYearOfBirthSelected: false,
      isLevelOfEducationSelected: false,
      host: '',
    };
    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING) };
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    progressiveProfilingPage.find('button.btn-brand').simulate('click');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.submit.clicked', expectedEventProperties);
  });

  // ******** test form submission ********

  it('should submit user profile details on form submission', () => {
    const formPayload = {
      gender: 'm',
      extended_profile: [{ field_name: 'company', field_value: 'test company' }],
    };
    store.dispatch = jest.fn(store.dispatch);
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

    progressiveProfilingPage.find('select#gender').simulate('change', { target: { value: 'm', name: 'gender' } });
    progressiveProfilingPage.find('input#company').simulate('change', { target: { value: 'test company', name: 'company' } });

    progressiveProfilingPage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).toHaveBeenCalledWith(saveUserProfile('abc123', formPayload));
  });

  it('should show error message when patch request fails', () => {
    store = mockStore({
      ...initialState,
      welcomePage: {
        ...initialState.welcomePage,
        showError: true,
      },
    });

    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));
    expect(progressiveProfilingPage.find('#pp-page-errors').exists()).toBeTruthy();
  });

  // ******** miscellaneous tests ********

  it('should redirect to login page if unauthenticated user tries to access welcome page', () => {
    getAuthenticatedUser.mockReturnValue(null);
    delete window.location;
    window.location = {
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
      href: getConfig().BASE_URL,
    };

    mount(reduxWrapper(<IntlProgressiveProfilingPage />));
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  describe('Recommendations test', () => {
    window.OnetrustActiveGroups = 'C0003';
    mergeConfig({
      ENABLE_POST_REGISTRATION_RECOMMENDATIONS: true,
    });

    it('should redirect to recommendations page if recommendations are enabled', () => {
      store = mockStore({
        ...initialState,
        welcomePage: {
          ...initialState.welcomePage,
          success: true,
        },
      });
      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

      expect(progressiveProfilingPage.find('button.btn-brand').text()).toEqual('Next');
      expect(mockNavigate).toHaveBeenCalledWith(RECOMMENDATIONS);
    });

    it('should not redirect to recommendations page if user is on its way to enroll in a course', async () => {
      const redirectUrl = `${getConfig().LMS_BASE_URL}${DEFAULT_REDIRECT_URL}?enrollment_action=1`;
      useLocation.mockReturnValue({
        state: {
          registrationResult: {
            redirectUrl,
            success: true,
          },
          optionalFields,
        },
      });

      store = mockStore({
        ...initialState,
        welcomePage: {
          ...initialState.welcomePage,
          success: true,
        },
      });

      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

      expect(progressiveProfilingPage.find('button.btn-brand').text()).toEqual('Submit');
      expect(window.location.href).toEqual(redirectUrl);
    });
  });

  describe('Embedded Form Workflow Test', () => {
    mergeConfig({
      SEARCH_CATALOG_URL: 'http://localhost/search',
    });
    const host = 'http://example.com';

    beforeEach(() => {
      useLocation.mockReturnValue({
        state: {},
      });
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          optionalFields,
        },
      });
    });

    it('should set host property value embedded host for on ramp experience for skip link event', () => {
      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}&variant=${EMBEDDED}`,
      };
      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));

      progressiveProfilingPage.find('button.btn-link').simulate('click');
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked', { host });
    });

    it('should set host property value to host where iframe is embedded for on ramp experience', () => {
      const expectedEventProperties = {
        isGenderSelected: false,
        isYearOfBirthSelected: false,
        isLevelOfEducationSelected: false,
        host: 'http://example.com',
      };
      delete window.location;
      window.location = {
        href: getConfig().BASE_URL.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}`,
      };
      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));
      progressiveProfilingPage.find('button.btn-brand').simulate('click');
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.submit.clicked', expectedEventProperties);
    });

    it('should render fields returned by backend API', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getConfig().BASE_URL,
        search: `?variant=${EMBEDDED}&host=${host}`,
      };

      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));
      expect(progressiveProfilingPage.find('#gender').exists()).toBeTruthy();
    });

    it('should redirect to dashboard if API call to get form field fails', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getConfig().BASE_URL,
        search: `?variant=${EMBEDDED}`,
      };
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: FAILURE_STATE,
        },
      });

      mount(reduxWrapper(<IntlProgressiveProfilingPage />));
      expect(window.location.href).toBe(DASHBOARD_URL);
    });

    it('should redirect to provided redirect url', () => {
      const redirectUrl = 'https://redirect-test.com';
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getConfig().BASE_URL,
        search: `?variant=${EMBEDDED}&host=${host}&next=${redirectUrl}`,
      };
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: COMPLETE_STATE,
          optionalFields,
          thirdPartyAuthContext: {
            welcomePageRedirectUrl: redirectUrl,
          },
        },
        welcomePage: {
          ...initialState.welcomePage,
          success: true,
        },
      });

      const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage />));
      progressiveProfilingPage.find('button.btn-brand').simulate('click');
      expect(window.location.href).toBe(redirectUrl);
    });
  });
});
