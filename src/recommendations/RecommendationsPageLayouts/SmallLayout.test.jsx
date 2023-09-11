import React from 'react';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import SmallLayout from './SmallLayout';
import mockedRecommendedProducts from '../data/tests/mockedData';

const IntlRecommendationsSmallLayoutPage = injectIntl(SmallLayout);

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
});
