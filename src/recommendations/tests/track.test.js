import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import {
  eventNames, trackRecommendationClick, trackRecommendationsGroup, trackRecommendationsViewed,
} from '../track';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('SegmentEventTrackingTest', () => {
  global.open = jest.fn();
  const userId = 1;

  it('test click event is fired properly and correct link is open for program product type', async () => {
    jest.useFakeTimers();
    const program = {
      cardType: 'program',
      title: 'test program',
      uuid: 'test_uuid',
      productSource: {
        name: 'test_source',
      },
      recommendationType: 'static',
      url: 'test_url',
    };
    const position = 0;
    const isControl = false;

    trackRecommendationClick(program, position, isControl, userId);
    jest.advanceTimersByTime(300);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendedProductClicked,
      {
        is_control: isControl,
        page: 'authn_recommendations',
        position,
        product_key: `${program.title} [${program.uuid}]`,
        product_line: program.cardType,
        product_source: program.productSource.name,
        recommendation_type: program.recommendationType,
        user_id: userId,
      },
    );

    expect(global.open).toBeCalled();
    expect(global.open).toHaveBeenCalledWith(program.url, '_blank');
  });

  it('test click event is fired properly and correct link is open for course product type', async () => {
    jest.useFakeTimers();
    const course = {
      cardType: 'course',
      activeRunKey: 'test_key',
      productSource: {
        name: 'test_source',
      },
      recommendationType: 'static',
      activeCourseRun: {
        marketingUrl: 'test_url',
      },
    };
    const position = 0;
    const isControl = false;

    trackRecommendationClick(course, position, isControl, userId);
    jest.advanceTimersByTime(300);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendedProductClicked,
      {
        is_control: isControl,
        page: 'authn_recommendations',
        position,
        product_key: course.activeRunKey,
        product_line: course.cardType,
        product_source: course.productSource.name,
        recommendation_type: course.recommendationType,
        user_id: userId,
      },
    );

    expect(global.open).toBeCalled();
    expect(global.open).toHaveBeenCalledWith(course.activeCourseRun.marketingUrl, '_blank');
  });

  it('test viewed events are fired properly', () => {
    const productList = [];
    const recommendationsType = 'static';
    const isControl = false;

    trackRecommendationsViewed(productList, recommendationsType, isControl, userId);
    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        products: productList,
        is_control: isControl,
        recommendation_type: recommendationsType,
        user_id: userId,
      },
    );
  });

  it('test group events are fired properly', () => {
    const variation = 'variation';

    trackRecommendationsGroup(variation, userId);
    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsGroup,
      {
        page: 'authn_recommendations',
        variation,
        user_id: userId,
      },
    );
  });
});
