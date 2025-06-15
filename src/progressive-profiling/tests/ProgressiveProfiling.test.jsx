import { Provider } from 'react-redux';

import {
  CurrentAppProvider,
  configureI18n,
  getAuthenticatedUser,
  getSiteConfig,
  identifyAuthenticatedUser,
  injectIntl,
  IntlProvider,
  mergeAppConfig,
  sendTrackEvent
} from '@openedx/frontend-base';
import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { MemoryRouter, mockNavigate, useLocation } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { testAppId } from '../../setupTest';
import {
  AUTHN_PROGRESSIVE_PROFILING,
  COMPLETE_STATE, DEFAULT_REDIRECT_URL,
  EMBEDDED,
  FAILURE_STATE,
  PENDING_STATE,
} from '../../data/constants';
import { saveUserProfile } from '../data/actions';
import ProgressiveProfiling from '../ProgressiveProfiling';

const IntlProgressiveProfilingPage = injectIntl(ProgressiveProfiling);
const mockStore = configureStore();

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
  configureAuth: jest.fn(),
  getAuthenticatedUser: jest.fn(),
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

  const DASHBOARD_URL = getSiteConfig().lmsBaseUrl.concat(DEFAULT_REDIRECT_URL);
  const registrationResult = { redirectUrl: getSiteConfig().lmsBaseUrl + DEFAULT_REDIRECT_URL, success: true };
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
        <CurrentAppProvider appId={testAppId}>
          <Provider store={store}>{children}</Provider>
        </CurrentAppProvider>
      </MemoryRouter>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore(initialState);
    configureI18n({
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
    useLocation.mockReturnValue({
      state: {
        registrationResult,
        optionalFields,
      },
    });
    getAuthenticatedUser.mockReturnValue({ userId: 3, username: 'abc123', name: 'Test User' });
  });

  // ******** test form links and modal ********

  it('should not display button "Learn more about how we use this information."', () => {
    mergeAppConfig(testAppId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: '',
    });
    const { queryByRole } = render(reduxWrapper(<IntlProgressiveProfilingPage />));
    const button = queryByRole('button', { name: /learn more about how we use this information/i });

    expect(button).toBeNull();
  });

  it('should display button "Learn more about how we use this information."', () => {
    mergeAppConfig(testAppId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });

    const { getByText } = render(reduxWrapper(<IntlProgressiveProfilingPage />));

    const learnMoreButton = getByText('Learn more about how we use this information.');

    expect(learnMoreButton).toBeDefined();
  });

  it('should open modal on pressing skip for now button', () => {
    delete window.location;
    window.location = { href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING) };
    const { getByRole } = render(reduxWrapper(<IntlProgressiveProfilingPage />));

    const skipButton = getByRole('button', { name: /skip for now/i });
    fireEvent.click(skipButton);

    const modalContentContainer = document.getElementsByClassName('.pgn__modal-content-container');

    expect(modalContentContainer).toBeTruthy();

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked', { host: '' });
  });

  // ******** test event functionality ********

  it('should make identify call to segment on progressive profiling page', () => {
    render(reduxWrapper(<IntlProgressiveProfilingPage />));

    expect(identifyAuthenticatedUser).toHaveBeenCalledWith(3);
    expect(identifyAuthenticatedUser).toHaveBeenCalled();
  });

  it('should send analytic event for support link click', () => {
    mergeAppConfig(testAppId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });
    render(reduxWrapper(<IntlProgressiveProfilingPage />));

    const supportLink = screen.getByRole('link', { name: /learn more about how we use this information/i });
    fireEvent.click(supportLink);

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.support.link.clicked');
  });

  // ******** test form submission ********

  it('should show error message when patch request fails', () => {
    store = mockStore({
      ...initialState,
      welcomePage: {
        ...initialState.welcomePage,
        showError: true,
      },
    });

    const { container } = render(reduxWrapper(<IntlProgressiveProfilingPage />));
    const errorElement = container.querySelector('#pp-page-errors');

    expect(errorElement).toBeTruthy();
  });

  // ******** miscellaneous tests ********

  it('should redirect to login page if unauthenticated user tries to access welcome page', () => {
    getAuthenticatedUser.mockReturnValue(null);
    delete window.location;
    window.location = {
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
      href: getSiteConfig().baseUrl,
    };

    render(reduxWrapper(<IntlProgressiveProfilingPage />));
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  describe('Embedded Form Workflow Test', () => {
    mergeAppConfig(testAppId, {
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
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}&variant=${EMBEDDED}`,
      };
      render(reduxWrapper(<IntlProgressiveProfilingPage />));

      const skipLinkButton = screen.getByText('Skip for now');
      fireEvent.click(skipLinkButton);

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked', { host });
    });

    it('should show spinner while fetching the optional fields', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}&variant=${EMBEDDED}`,
      };

      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: PENDING_STATE,
          optionalFields,
        },
      });

      const { container } = render(reduxWrapper(<IntlProgressiveProfilingPage />));

      const tpaSpinnerElement = container.querySelector('#tpa-spinner');
      expect(tpaSpinnerElement).toBeTruthy();
    });

    it('should render fields returned by backend API', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getSiteConfig().baseUrl,
        search: `?variant=${EMBEDDED}&host=${host}`,
      };

      const { container } = render(reduxWrapper(<IntlProgressiveProfilingPage />));

      const genderField = container.querySelector('#gender');
      expect(genderField).toBeTruthy();
    });

    it('should redirect to dashboard if API call to get form field fails', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getSiteConfig().baseUrl,
        search: `?variant=${EMBEDDED}`,
      };
      store = mockStore({
        ...initialState,
        commonComponents: {
          ...initialState.commonComponents,
          thirdPartyAuthApiStatus: FAILURE_STATE,
        },
      });

      render(reduxWrapper(<IntlProgressiveProfilingPage />));
      expect(window.location.href).toBe(DASHBOARD_URL);
    });

    it('should redirect to provided redirect url', () => {
      const redirectUrl = 'https://redirect-test.com';
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getSiteConfig().baseUrl,
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

      render(reduxWrapper(<IntlProgressiveProfilingPage />));
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      expect(window.location.href).toBe(redirectUrl);
    });
  });
});
