import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import configureStore from 'redux-mock-store';

import { mockedGeneralRecommendations, mockedResponse } from './mockedData';
import { DEFAULT_REDIRECT_URL } from '../../data/constants';
import getPersonalizedRecommendations from '../data/service';
import { trackRecommendationCardClickOptimizely } from '../optimizelyExperiment';
import RecommendationsPage from '../RecommendationsPage';

const IntlRecommendationsPage = injectIntl(RecommendationsPage);
const mockStore = configureStore();

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
jest.mock('../data/service', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../optimizelyExperiment', () => ({
  trackRecommendationCardClickOptimizely: jest.fn(),
}));

describe('RecommendationsPageTests', () => {
  mergeConfig({
    GENERAL_RECOMMENDATIONS: '[]',
  });

  let defaultProps = {};
  let store = {};

  let registrationResult = {
    redirectUrl: getConfig().LMS_BASE_URL.concat('/course-about-page-url'),
    success: true,
  };
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const getRecommendationsPage = async (props = defaultProps) => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage {...props} />));
    await act(async () => {
      await Promise.resolve(recommendationsPage);
      recommendationsPage.update();
    });

    return recommendationsPage;
  };

  beforeEach(() => {
    store = mockStore({});
    defaultProps = {
      location: {
        state: {
          registrationResult,
          userId: 111,
        },
      },
    };
  });

  it('redirects to dashboard if user tries to access the page directly', async () => {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    delete window.location;
    window.location = {
      href: getConfig().BASE_URL,
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
    };
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve([]));
    await getRecommendationsPage({});

    expect(getPersonalizedRecommendations).toHaveBeenCalledTimes(0);
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });
  it('redirects to dashboard if user click on skip button', async () => {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    registrationResult = {
      ...registrationResult,
      redirectUrl: getConfig().LMS_BASE_URL.concat('/dashboard'),
    };
    const props = {
      location: {
        state: {
          registrationResult,
          userId: 111,
        },
      },
    };
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage(props);
    recommendationsPage.find('button').simulate('click');
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  it('should call trackRecommendationCardClickOptimizely when card is clicked', async () => {
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();
    recommendationsPage.find('.card-box').first().simulate('click');
    expect(trackRecommendationCardClickOptimizely).toHaveBeenCalledTimes(1);
  });

  it('should show loading state to user', async () => {
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve(mockedResponse));
    await act(async () => {
      const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage {...defaultProps} />));
      expect(recommendationsPage.find('.spinner--position-centered').exists()).toBeTruthy();
    });
  });

  it('should call getPersonalizedRecommendations', async () => {
    delete window.location;
    window.location = { assign: jest.fn() };
    getPersonalizedRecommendations.mockClear();
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve([]));
    await getRecommendationsPage();

    expect(getPersonalizedRecommendations).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.bi.user.recommendations.viewed',
      {
        page: 'authn_recommendations',
        course_key_array: [],
        amplitude_recommendations: false,
        is_control: false,
        user_id: 111,
      },
    );
  });

  it('should display recommendations returned by Algolia', async () => {
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeTruthy();
  });

  it('should not display recommendations if error comes in while fetching the recommendations', async () => {
    getPersonalizedRecommendations.mockImplementation(() => Promise.reject(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#recommendation-card').exists()).toBeFalsy();
  });

  it('should redirect if recommended courses count is less than RECOMMENDATIONS_COUNT', async () => {
    delete window.location;
    window.location = { assign: jest.fn() };
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve([mockedResponse[0]]));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeFalsy();
    expect(window.location.href).toEqual(registrationResult.redirectUrl);
  });

  it('should not redirect if fallback recommendations are enabled', async () => {
    mergeConfig({
      GENERAL_RECOMMENDATIONS: mockedGeneralRecommendations,
    });
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve([]));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeTruthy();
  });

  it('should display all owners for a course', async () => {
    getPersonalizedRecommendations.mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();

    expect(
      recommendationsPage.find('.pgn__card-header-subtitle-md').getElements()[0].props.children,
    ).toEqual('firstOwnerX, secondOwnerX');
  });
});
