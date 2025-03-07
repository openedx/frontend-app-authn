import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import {
  eventNames, trackRecommendationClick, trackRecommendationsViewed, trackSkipButtonClicked,
} from '../track';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('SegmentEventTrackingTest', () => {
  global.open = jest.fn();
  const userId = 1;

  it('test click event is fired properly and correct link opens for program product type', async () => {
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

    trackRecommendationClick(program, position, userId);
    jest.advanceTimersByTime(300);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendedProductClicked,
      {
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

  it('test click event is fired properly and correct link opens for course product type', async () => {
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

    trackRecommendationClick(course, position, userId);
    jest.advanceTimersByTime(300);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendedProductClicked,
      {
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
    const productList = [
      {
        title: 'Test Program',
        uuid: '1234-5678-9101-1213',
        cardType: 'program',
        productSource: {
          name: 'org name',
        },
      },
    ];
    const recommendationsType = 'static';
    const expectedProductList = [
      {
        product_key: 'Test Program [1234-5678-9101-1213]',
        product_line: 'program',
        product_source: 'org name',
      },
    ];

    trackRecommendationsViewed(productList, recommendationsType, userId);
    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.recommendationsViewed,
      {
        page: 'authn_recommendations',
        products: expectedProductList,
        recommendation_type: recommendationsType,
        user_id: userId,
      },
    );
  });

  it('test skip button event is fired with correct properties', () => {
    trackSkipButtonClicked(userId);

    expect(sendTrackEvent).toBeCalled();
    expect(sendTrackEvent).toHaveBeenCalledWith(
      eventNames.skipButtonClicked,
      {
        page: 'authn_recommendations',
        user_id: userId,
      },
    );
  });
});
