import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { useMediaQuery } from '@edx/paragon';
import { mount } from 'enzyme';
import { useLocation } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { DEFAULT_REDIRECT_URL } from '../../data/constants';
import { PERSONALIZED, POPULAR } from '../data/constants';
import useRecommendations from '../data/hooks/useRecommendations';
import mockedRecommendedProducts from '../data/tests/mockedData';
import RecommendationsPage from '../RecommendationsPage';
import { eventNames, getProductMapping } from '../track';

const IntlRecommendationsPage = injectIntl(RecommendationsPage);
const mockStore = configureStore();

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@edx/paragon', () => ({
  ...jest.requireActual('@edx/paragon'),
  useMediaQuery: jest.fn(),
}));

jest.mock('../data/hooks/useRecommendations', () => jest.fn());

describe('RecommendationsPageTests', () => {
  mergeConfig({
    GENERAL_RECOMMENDATIONS: '[]',
    POPULAR_PRODUCTS: '[]',
    TRENDING_PRODUCTS: '[]',
  });

  let store = {};

  const dashboardUrl = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const redirectUrl = getConfig().LMS_BASE_URL.concat('/course-about-page-url');

  const registrationResult = {
    redirectUrl,
    success: true,
  };
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const mockUseLocation = () => (
    useLocation.mockReturnValue({
      state: {
        registrationResult,
        userId: 111,
      },
    })
  );

  beforeEach(() => {
    store = mockStore({
      register: {
        backendCountryCode: 'PK',
      },
    });
    useLocation.mockReturnValue({
      state: {},
    });
  });

  useRecommendations.mockReturnValue({
    algoliaRecommendations: mockedRecommendedProducts,
    popularProducts: mockedRecommendedProducts,
    trendingProducts: mockedRecommendedProducts,
    isLoading: false,
  });

  it('should redirect to dashboard if user is not coming from registration workflow', () => {
    mount(reduxWrapper(<IntlRecommendationsPage />));
    expect(window.location.href).toEqual(dashboardUrl);
  });

  it('should redirect if either popular or trending recommendations are not configured', () => {
    mockUseLocation();
    useRecommendations.mockReturnValueOnce({
      algoliaRecommendations: mockedRecommendedProducts,
      popularProducts: [],
      trendingProducts: mockedRecommendedProducts,
      isLoading: false,
    });
    mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(window.location.href).toEqual(redirectUrl);
  });

  it('should redirect user if they click "Skip for now" button', () => {
    mockUseLocation();
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));
    recommendationsPage.find('.pgn__stateful-btn-state-default').first().simulate('click');

    expect(window.location.href).toEqual(redirectUrl);
  });

  it('should display recommendations small layout (collapsibles) for small screen', () => {
    mockUseLocation();
    useMediaQuery.mockReturnValue(true);
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(recommendationsPage.find('.pgn_collapsible').exists()).toBeTruthy();
    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeFalsy();
  });

  it('should display recommendations large layout for large screen', () => {
    mockUseLocation();
    useMediaQuery.mockReturnValue(false);
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(recommendationsPage.find('.pgn_collapsible').exists()).toBeFalsy();
    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeFalsy();
  });

  it('should display skeletons if recommendations are loading for large screen', () => {
    mockUseLocation();
    useMediaQuery.mockReturnValue(false);
    useRecommendations.mockReturnValueOnce({
      algoliaRecommendations: [],
      popularProducts: [],
      trendingProducts: [],
      isLoading: true,
    });
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeTruthy();
  });

  it('should display skeletons if recommendations are loading for small screen', () => {
    mockUseLocation();
    useMediaQuery.mockReturnValue(true);
    useRecommendations.mockReturnValueOnce({
      algoliaRecommendations: [],
      popularProducts: [],
      trendingProducts: [],
      isLoading: true,
    });
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeTruthy();
  });

  it('should display only trending and popular recs if there are no algolia recommendations', () => {
    mockUseLocation();
    useMediaQuery.mockReturnValue(false);
    useRecommendations.mockReturnValueOnce({
      algoliaRecommendations: [],
      popularProducts: mockedRecommendedProducts,
      trendingProducts: mockedRecommendedProducts,
      isLoading: false,
    });
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage />));

    expect(recommendationsPage.find('.recommendations-container__card-list').length).toEqual(2);
  });

  it('[Large Screen] should fire recommendations viewed event for all recommendations', () => {
    mockUseLocation();
    useRecommendations.mockReturnValue({
      algoliaRecommendations: mockedRecommendedProducts,
      popularProducts: mockedRecommendedProducts,
      trendingProducts: [],
      isLoading: false,
    });

    useMediaQuery.mockReturnValue(false);
    mount(reduxWrapper(<IntlRecommendationsPage />));

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

    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: POPULAR,
        products: getProductMapping(mockedRecommendedProducts),
        user_id: 111,
      },
    );
  });

  it('[Small Screen] should fire recommendations viewed event on mount for personalized recommendations only', () => {
    useRecommendations.mockReturnValue({
      algoliaRecommendations: mockedRecommendedProducts,
      popularProducts: mockedRecommendedProducts,
      trendingProducts: [],
      isLoading: false,
    });

    useMediaQuery.mockReturnValue(true);
    mount(reduxWrapper(<IntlRecommendationsPage />));

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
