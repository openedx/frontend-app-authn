import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useMediaQuery } from '@openedx/paragon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { DEFAULT_REDIRECT_URL } from '../../data/constants';
import { useRegisterContext } from '../../register/components/RegisterContext';
import { PERSONALIZED } from '../data/constants';
import useAlgoliaRecommendations from '../data/hooks/useAlgoliaRecommendations';
import mockedRecommendedProducts from '../data/tests/mockedData';
import RecommendationsPage from '../RecommendationsPage';
import { eventNames, getProductMapping } from '../track';

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

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: 'http://localhost:18000',
  })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../data/hooks/useAlgoliaRecommendations', () => jest.fn());

jest.mock('../../register/components/RegisterContext', () => ({
  ...jest.requireActual('../../register/components/RegisterContext'),
  useRegisterContext: jest.fn(),
}));

describe('RecommendationsPageTests', () => {
  let queryClient;

  const dashboardUrl = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const redirectUrl = getConfig().LMS_BASE_URL.concat('/course-about-page-url');

  const registrationResult = {
    redirectUrl,
    success: true,
  };

  const renderWithProviders = (children) => {
    queryClient = createTestQueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en" messages={{}}>
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>,
    );
  };

  const mockUseRegisterContext = (registrationResult = null, backendCountryCode = 'US') => {
    useRegisterContext.mockReturnValue({
      registrationResult,
      backendCountryCode,
    });
  };

  const mockLocationState = (userId = 111) => {
    useLocation.mockReturnValue({
      pathname: '/recommendations',
      state: {
        userId,
      },
    });
  };

  beforeEach(() => {
    useLocation.mockReturnValue({
      state: {},
    });

    useRegisterContext.mockReturnValue({
      registrationResult: null,
      backendCountryCode: 'US',
    });

    useAlgoliaRecommendations.mockReturnValue({
      recommendations: mockedRecommendedProducts,
      isLoading: false,
    });

    // Mock window.location with getter and setter for href
    delete window.location;
    window.location = {
      href: '',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
    };

    // Mock the href property with getter and setter
    Object.defineProperty(window.location, 'href', {
      get: () => window.location._href || '',
      set: (value) => { window.location._href = value; },
      configurable: true,
    });
  });

  it('should redirect to dashboard if user is not coming from registration workflow', () => {
    const originalLocationHref = window.location.href;
    const setHref = jest.fn();
    Object.defineProperty(window.location, 'href', {
      get: () => originalLocationHref,
      set: setHref,
      configurable: true,
    });

    act(() => {
      renderWithProviders(<RecommendationsPage />);
    });

    expect(setHref).toHaveBeenCalledWith(dashboardUrl);
  });

  it('should redirect user if no personalized recommendations are available', () => {
    const originalLocationHref = window.location.href;
    const setHref = jest.fn();
    Object.defineProperty(window.location, 'href', {
      get: () => originalLocationHref,
      set: setHref,
      configurable: true,
    });

    // This test needs registrationResult to get past the first redirect check
    mockUseRegisterContext(registrationResult);
    useAlgoliaRecommendations.mockReturnValue({
      recommendations: [], // Empty recommendations array
      isLoading: false,
    });

    act(() => {
      renderWithProviders(<RecommendationsPage />);
    });

    expect(setHref).toHaveBeenCalledWith(redirectUrl);
  });

  it('should redirect user if they click "Skip for now" button', () => {
    const originalLocationHref = window.location.href;
    const setHref = jest.fn();
    Object.defineProperty(window.location, 'href', {
      get: () => originalLocationHref,
      set: setHref,
      configurable: true,
    });

    mockUseRegisterContext(registrationResult);
    jest.useFakeTimers();
    let container;
    act(() => {
      ({ container } = renderWithProviders(<RecommendationsPage />));
    });
    const skipButton = container.querySelector('.pgn__stateful-btn-state-default');
    act(() => {
      fireEvent.click(skipButton);
      jest.advanceTimersByTime(300);
    });

    expect(setHref).toHaveBeenCalledWith(redirectUrl);
  });

  it('should display recommendations small layout for small screen', () => {
    mockUseRegisterContext(registrationResult);
    useMediaQuery.mockReturnValue(true);
    const { container } = renderWithProviders(<RecommendationsPage />);

    const recommendationsSmallLayout = container.querySelector('#recommendations-small-layout');
    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(recommendationsSmallLayout).toBeTruthy();
    expect(reactLoadingSkeleton).toBeFalsy();
  });

  it('should display recommendations large layout for large screen', () => {
    mockUseRegisterContext(registrationResult);
    useMediaQuery.mockReturnValue(false);
    const { container } = renderWithProviders(<RecommendationsPage />);

    const pgnCollapsible = container.querySelector('.pgn_collapsible');
    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(pgnCollapsible).toBeFalsy();
    expect(reactLoadingSkeleton).toBeFalsy();
  });

  it('should display skeletons if recommendations are loading for large screen', () => {
    mockUseRegisterContext(registrationResult);
    useMediaQuery.mockReturnValue(false);
    useAlgoliaRecommendations.mockReturnValueOnce({
      recommendations: [],
      isLoading: true,
    });
    const { container } = renderWithProviders(<RecommendationsPage />);

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeTruthy();
  });

  it('should display skeletons if recommendations are loading for small screen', () => {
    mockUseRegisterContext(registrationResult);
    useMediaQuery.mockReturnValue(true);
    useAlgoliaRecommendations.mockReturnValueOnce({
      recommendations: [],
      isLoading: true,
    });
    const { container } = renderWithProviders(<RecommendationsPage />);

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeTruthy();
  });

  it('should fire recommendations viewed event', () => {
    mockUseRegisterContext(registrationResult);
    mockLocationState(111); // Provide userId
    useAlgoliaRecommendations.mockReturnValue({
      recommendations: mockedRecommendedProducts,
      isLoading: false,
    });

    useMediaQuery.mockReturnValue(false);
    renderWithProviders(<RecommendationsPage />);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: PERSONALIZED,
        products: getProductMapping(mockedRecommendedProducts),
        user_id: 111,
      },
    );
  });
});
