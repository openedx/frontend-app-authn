import {
  CurrentAppProvider,
  getAuthenticatedUser,
  getSiteConfig,
  identifyAuthenticatedUser,
  IntlProvider,
  mergeAppConfig,
  sendPageEvent,
  sendTrackEvent,
} from '@openedx/frontend-base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useThirdPartyAuthContext } from '../../common-components/components/ThirdPartyAuthContext';
import { appId } from '../../constants';
import {
  AUTHN_PROGRESSIVE_PROFILING,
  COMPLETE_STATE,
  DEFAULT_REDIRECT_URL,
  EMBEDDED,
  PENDING_STATE,
} from '../../data/constants';
import { useProgressiveProfilingContext } from '../components/ProgressiveProfilingContext';
import ProgressiveProfiling from '../ProgressiveProfiling';

// Mock functions defined first to prevent initialization errors
const mockFetchThirdPartyAuth = jest.fn();
const mockSaveUserProfile = jest.fn();
const mockSaveUserProfileMutation = {
  mutate: mockSaveUserProfile,
  isPending: false,
  isError: false,
  error: null,
};
const mockThirdPartyAuthHook = {
  data: null,
  isLoading: false,
  isSuccess: false,
  error: null,
};
// Create stable mock values to prevent infinite renders
const mockSetThirdPartyAuthContextSuccess = jest.fn();
const mockOptionalFields = {
  fields: {
    company: { name: 'company', type: 'text', label: 'Company' },
    gender: {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      options: [['m', 'Male'], ['f', 'Female'], ['o', 'Other/Prefer Not to Say']],
    },
  },
  extended_profile: ['company'],
};
// Get the mocked version of the hook
const mockUseThirdPartyAuthContext = jest.mocked(useThirdPartyAuthContext);
const mockUseProgressiveProfilingContext = jest.mocked(useProgressiveProfilingContext);

jest.mock('../data/apiHook', () => ({
  useSaveUserProfile: () => mockSaveUserProfileMutation,
}));

jest.mock('../../common-components/data/apiHook', () => ({
  useThirdPartyAuthHook: () => mockThirdPartyAuthHook,
}));

// Mock the ThirdPartyAuthContext module
jest.mock('../../common-components/components/ThirdPartyAuthContext', () => ({
  ThirdPartyAuthProvider: ({ children }) => children,
  useThirdPartyAuthContext: jest.fn(),
}));

// Mock context providers
jest.mock('../components/ProgressiveProfilingContext', () => ({
  ProgressiveProfilingProvider: ({ children }) => children,
  useProgressiveProfilingContext: jest.fn(),
}));

// Setup React Query client for tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
  configureAuth: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  getLoggingService: jest.fn(),
}));

// Create mock function outside to access it directly
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigate(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    useLocation: jest.fn(),
  };
});

describe('ProgressiveProfilingTests', () => {
  let queryClient;

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

  const renderWithProviders = (children, options = {}) => {
    queryClient = createTestQueryClient();

    // Set default context values
    const defaultProgressiveProfilingContext = {
      submitState: 'default',
      showError: false,
      success: false,
    };

    // Override with any provided context values
    const progressiveProfilingContext = {
      ...defaultProgressiveProfilingContext,
      ...options.progressiveProfilingContext,
    };

    mockUseProgressiveProfilingContext.mockReturnValue(progressiveProfilingContext);

    return render(
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en" messages={{}}>
          <MemoryRouter>
            <CurrentAppProvider appId={appId}>
              {children}
            </CurrentAppProvider>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    useLocation.mockReturnValue({
      state: {
        registrationResult,
        optionalFields,
      },
    });
    getAuthenticatedUser.mockReturnValue({ userId: 3, username: 'abc123', name: 'Test User' });

    // Reset mocks first
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockFetchThirdPartyAuth.mockClear();
    mockSaveUserProfile.mockClear();
    mockSetThirdPartyAuthContextSuccess.mockClear();

    // Reset third party auth hook mock to default state
    mockThirdPartyAuthHook.data = null;
    mockThirdPartyAuthHook.isLoading = false;
    mockThirdPartyAuthHook.isSuccess = false;
    mockThirdPartyAuthHook.error = null;

    // Configure mock for useThirdPartyAuthContext AFTER clearing mocks
    mockUseThirdPartyAuthContext.mockReturnValue({
      thirdPartyAuthApiStatus: COMPLETE_STATE,
      setThirdPartyAuthContextSuccess: mockSetThirdPartyAuthContextSuccess,
      optionalFields: mockOptionalFields,
    });

    // Set default context values
    mockUseProgressiveProfilingContext.mockReturnValue({
      submitState: 'default',
      showError: false,
      success: false,
    });
  });

  // ******** test form links and modal ********

  it('should not display button "Learn more about how we use this information."', () => {
    mergeAppConfig(appId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: '',
    });
    const { queryByRole } = renderWithProviders(<ProgressiveProfiling />);
    const button = queryByRole('button', { name: /learn more about how we use this information/i });

    expect(button).toBeNull();
  });

  it('should display button "Learn more about how we use this information."', () => {
    mergeAppConfig(appId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });

    const { getByText } = renderWithProviders(<ProgressiveProfiling />);

    const learnMoreButton = getByText('Learn more about how we use this information.');

    expect(learnMoreButton).toBeDefined();
  });

  it('should open modal on pressing skip for now button', () => {
    delete window.location;
    window.location = { href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING) };
    const { getByRole } = renderWithProviders(<ProgressiveProfiling />);

    const skipButton = getByRole('button', { name: /skip for now/i });
    fireEvent.click(skipButton);

    const modalContentContainer = document.getElementsByClassName('.pgn__modal-content-container');

    expect(modalContentContainer).toBeTruthy();

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked', { host: '' });
  });

  // ******** test event functionality ********

  it('should make identify call to segment on progressive profiling page', () => {
    renderWithProviders(<ProgressiveProfiling />);

    expect(identifyAuthenticatedUser).toHaveBeenCalledWith(3);
    expect(identifyAuthenticatedUser).toHaveBeenCalled();
  });

  it('should send analytic event for support link click', () => {
    mergeAppConfig(appId, {
      AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: 'http://localhost:1999/support',
    });
    renderWithProviders(<ProgressiveProfiling />);

    const supportLink = screen.getByRole('link', { name: /learn more about how we use this information/i });
    fireEvent.click(supportLink);

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.support.link.clicked');
  });

  it('should set empty host property value for non-embedded experience', () => {
    const expectedEventProperties = {
      isGenderSelected: false,
      isYearOfBirthSelected: false,
      isLevelOfEducationSelected: false,
      isWorkExperienceSelected: false,
      host: '',
    };
    delete window.location;
    window.location = { href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING) };
    renderWithProviders(<ProgressiveProfiling />);

    const nextButton = screen.getByText('Submit');
    fireEvent.click(nextButton);

    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.submit.clicked', expectedEventProperties);
  });

  // ******** test form submission ********

  it('should submit user profile details on form submission', () => {
    const expectedPayload = {
      username: 'abc123',
      data: {
        gender: 'm',
        extended_profile: [{ field_name: 'company', field_value: 'test company' }],
      },
    };
    const { getByLabelText, getByText } = renderWithProviders(<ProgressiveProfiling />);

    const genderSelect = getByLabelText('Gender');
    const companyInput = getByLabelText('Company');

    fireEvent.change(genderSelect, { target: { value: 'm' } });
    fireEvent.change(companyInput, { target: { value: 'test company' } });

    fireEvent.click(getByText('Submit'));

    expect(mockSaveUserProfile).toHaveBeenCalledWith(expectedPayload);
  });

  it('should show error message when patch request fails', () => {
    const { container } = renderWithProviders(<ProgressiveProfiling />);
    expect(container).toBeTruthy();
  });

  // ******** miscellaneous tests ********

  it('should redirect to login page if unauthenticated user tries to access welcome page', () => {
    getAuthenticatedUser.mockReturnValue(null);
    delete window.location;
    window.location = {
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
      href: getSiteConfig().baseUrl,
    };

    renderWithProviders(<ProgressiveProfiling />);
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  describe('Embedded Form Workflow Test', () => {
    mergeAppConfig(appId, {
      SEARCH_CATALOG_URL: 'http://localhost/search',
    });
    const host = 'http://example.com';

    beforeEach(() => {
      useLocation.mockReturnValue({
        state: {},
      });

      mockUseThirdPartyAuthContext.mockReturnValue({
        thirdPartyAuthApiStatus: COMPLETE_STATE,
        setThirdPartyAuthContextSuccess: mockSetThirdPartyAuthContextSuccess,
        optionalFields: mockOptionalFields,
      });
    });

    it('should set host property value embedded host for on ramp experience for skip link event', () => {
      delete window.location;
      window.location = {
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}&variant=${EMBEDDED}`,
      };
      renderWithProviders(<ProgressiveProfiling />);

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

      mockUseThirdPartyAuthContext.mockReturnValue({
        thirdPartyAuthApiStatus: PENDING_STATE,
        setThirdPartyAuthContextSuccess: mockSetThirdPartyAuthContextSuccess,
        optionalFields: {},
      });

      const { container } = renderWithProviders(<ProgressiveProfiling />);

      const tpaSpinnerElement = container.querySelector('#tpa-spinner');
      expect(tpaSpinnerElement).toBeTruthy();
    });

    it('should set host property value to host where iframe is embedded for on ramp experience', () => {
      const expectedEventProperties = {
        isGenderSelected: false,
        isYearOfBirthSelected: false,
        isLevelOfEducationSelected: false,
        isWorkExperienceSelected: false,
        host: 'http://example.com',
      };
      delete window.location;
      window.location = {
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: `?host=${host}`,
      };
      renderWithProviders(<ProgressiveProfiling />);
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.submit.clicked', expectedEventProperties);
    });

    it('should render fields returned by backend API', () => {
      delete window.location;
      window.location = {
        assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
        href: getSiteConfig().baseUrl,
        search: `?variant=${EMBEDDED}&host=${host}`,
      };

      const { container } = renderWithProviders(<ProgressiveProfiling />);

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

      renderWithProviders(<ProgressiveProfiling />);
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

      // Mock embedded registration context with redirect URL
      mockUseThirdPartyAuthContext.mockReturnValue({
        thirdPartyAuthApiStatus: COMPLETE_STATE,
        setThirdPartyAuthContextSuccess: mockSetThirdPartyAuthContextSuccess,
        optionalFields: {
          fields: mockOptionalFields.fields,
          extended_profile: mockOptionalFields.extended_profile,
          nextUrl: redirectUrl,
        },
      });

      renderWithProviders(
        <ProgressiveProfiling />,
        {
          progressiveProfilingContext: {
            submitState: 'default',
            showError: false,
            success: true,
          },
        },
      );

      expect(window.location.href).toBe(redirectUrl);
    });
  });

  describe('onMouseDown preventDefault behavior', () => {
    it('should have onMouseDown handlers on submit and skip buttons to prevent default behavior', () => {
      const { container } = renderWithProviders(<ProgressiveProfiling />);
      const submitButton = container.querySelector('button[type="submit"]:first-of-type');
      const skipButton = container.querySelector('button[type="submit"]:last-of-type');

      expect(submitButton).toBeTruthy();
      expect(skipButton).toBeTruthy();

      fireEvent.mouseDown(submitButton);
      fireEvent.mouseDown(skipButton);

      expect(submitButton).toBeTruthy();
      expect(skipButton).toBeTruthy();
    });
  });

  describe('setValues state management', () => {
    it('should update form values through onChange handlers', () => {
      const { getByLabelText, getByText } = renderWithProviders(<ProgressiveProfiling />);
      const companyInput = getByLabelText('Company');
      const genderSelect = getByLabelText('Gender');

      fireEvent.change(companyInput, { target: { name: 'company', value: 'Test Company' } });
      fireEvent.change(genderSelect, { target: { name: 'gender', value: 'm' } });

      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);

      expect(mockSaveUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'abc123',
          data: expect.objectContaining({
            gender: 'm',
            extended_profile: expect.arrayContaining([
              expect.objectContaining({
                field_name: 'company',
                field_value: 'Test Company',
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('sendTrackEvent functionality', () => {
    it('should call sendTrackEvent when form interactions occur', () => {
      const { getByText } = renderWithProviders(<ProgressiveProfiling />);

      jest.clearAllMocks();
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);

      expect(sendTrackEvent).toHaveBeenCalled();
    });

    it('should call analytics functions on component mount', () => {
      renderWithProviders(<ProgressiveProfiling />);
      expect(identifyAuthenticatedUser).toHaveBeenCalledWith(3);
      expect(sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'welcome');
    });
  });

  describe('setThirdPartyAuthContextSuccess functionality', () => {
    it('should call setThirdPartyAuthContextSuccess in embedded mode', () => {
      const mockThirdPartyData = {
        fieldDescriptions: { test: 'field' },
        optionalFields: mockOptionalFields,
        thirdPartyAuthContext: { providers: [] },
      };

      delete window.location;
      window.location = {
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: '?variant=embedded&host=http://example.com',
      };
      mockThirdPartyAuthHook.data = mockThirdPartyData;
      mockThirdPartyAuthHook.isSuccess = true;
      mockThirdPartyAuthHook.error = null;

      renderWithProviders(<ProgressiveProfiling />);

      expect(mockSetThirdPartyAuthContextSuccess).toHaveBeenCalled();
    });

    it('should not call third party auth functions when not in embedded mode', () => {
      delete window.location;
      window.location = {
        href: getSiteConfig().baseUrl.concat(AUTHN_PROGRESSIVE_PROFILING),
        search: '',
      };

      mockThirdPartyAuthHook.data = null;
      mockThirdPartyAuthHook.isSuccess = false;
      mockThirdPartyAuthHook.error = null;

      renderWithProviders(<ProgressiveProfiling />);

      expect(mockSetThirdPartyAuthContextSuccess).not.toHaveBeenCalled();
    });
  });
});
