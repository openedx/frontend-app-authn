import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import configureStore from 'redux-mock-store';

import mockedCoursesData from './mockedData';
import { trackRecommendationCardClickOptimizely } from '../optimizelyExperiment';
import RecommendationList from '../RecommendationsList';

const IntlRecommendationList = injectIntl(RecommendationList);
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

describe('RecommendationsListTests', () => {
  mergeConfig({
    GENERAL_RECOMMENDATIONS: '[]',
  });

  let defaultProps = {};
  let store = {};

  const registrationResult = {
    redirectUrl: getConfig().LMS_BASE_URL.concat('/course-about-page-url'),
    success: true,
  };
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const getRecommendationsList = async (props = defaultProps) => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationList {...props} />));
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

  it('should render the product card with formatted message in card', async () => {
    const props = {
      recommendations: [mockedCoursesData[4]],
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    expect(recommendationsList.find('.x-small').at(0).text()).toEqual('Offered on Emeritus');
  });

  it('should call trackRecommendationCardClickOptimizely when card is clicked', async () => {
    const props = {
      recommendations: [mockedCoursesData[1]],
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    recommendationsList.find('.card-box').first().simulate('click');
    expect(trackRecommendationCardClickOptimizely).toHaveBeenCalledTimes(1);
  });

  it('should render the recommendations card with with facets', async () => {
    const props = {
      recommendations: [mockedCoursesData[1]],
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    expect(recommendationsList.find('.d-inline-block').at(0).text()).toEqual('6 Modules');
  });

  it('should render the recommendations card with footer content when subscription view is enabled', async () => {
    const props = {
      recommendations: [mockedCoursesData[3]],
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    expect(recommendationsList.find('.d-inline-block').at(1).text()).toEqual('Subscription');
  });

  it('should render the recommendations card with footer content', async () => {
    const props = {
      recommendations: [mockedCoursesData[0]],
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    expect(recommendationsList.find('.x-small').text()).toEqual('4 Courses');
  });

  it('should render the recommendations list', async () => {
    const props = {
      recommendations: mockedCoursesData,
      title: 'We have a few recommendations to get you started.',
      userId: 1234567,
      setSelectedRecommendationsType: jest.fn(),
      selectedRecommendationsType: { title: 'Trending courses', value: 'trending' },
    };
    const recommendationsList = await getRecommendationsList(props);
    expect(recommendationsList.find('.recommendation-card').length).toBe(5);
  });
});
