import React from 'react';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import SmallLayout from './SmallLayout';
import { PERSONALIZED, POPULAR, TRENDING } from '../data/constants';
import mockedRecommendedProducts from '../data/tests/mockedData';
import { eventNames, getProductMapping } from '../track';

const IntlRecommendationsSmallLayoutPage = injectIntl(SmallLayout);

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

describe('RecommendationsPageTests', () => {
  let props = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  );

  beforeEach(() => {
    props = {
      userId: 123,
      personalizedRecommendations: mockedRecommendedProducts,
      popularProducts: mockedRecommendedProducts,
      trendingProducts: mockedRecommendedProducts,
      isLoading: false,
    };
  });

  it('should render recommendations when recommendations are not loading', () => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));
    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeFalsy();
  });

  it('should render loading state when recommendations are loading', () => {
    props = {
      ...props,
      isLoading: true,
    };
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));
    expect(recommendationsPage.find('.react-loading-skeleton').exists()).toBeTruthy();
  });

  it('should fire recommendations viewed event on mount for personalized recommendations only if available', () => {
    mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: PERSONALIZED,
        products: getProductMapping(props.personalizedRecommendations),
        user_id: props.userId,
      },
    );
  });

  it('should fire recommendations viewed event on mount for popular recs if personalized not available', () => {
    props = {
      ...props,
      personalizedRecommendations: [],
    };

    mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: POPULAR,
        products: getProductMapping(props.popularProducts),
        user_id: props.userId,
      },
    );
  });

  it('should fire recommendations viewed event on collapsible open for popular recs', () => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    recommendationsPage.find('.collapsible-trigger span').filterWhere(
      (span) => span.text() === 'Most Popular',
    ).simulate('click');

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: POPULAR,
        products: getProductMapping(props.popularProducts),
        user_id: props.userId,
      },
    );
  });

  it('should fire recommendations viewed event on collapsible open for trending recs', () => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    recommendationsPage.find('.collapsible-trigger span').filterWhere(
      (span) => span.text() === 'Trending Now',
    ).simulate('click');

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        recommendation_type: TRENDING,
        products: getProductMapping(props.trendingProducts),
        user_id: props.userId,
      },
    );
  });
});
