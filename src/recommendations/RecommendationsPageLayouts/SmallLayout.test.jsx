import React from 'react';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';

import SmallLayout from './SmallLayout';
import mockedRecommendedProducts from '../data/tests/mockedData';

const IntlRecommendationsSmallLayoutPage = injectIntl(SmallLayout);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
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
    const { container } = render(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeNull();
  });

  it('should render loading state when recommendations are loading', () => {
    props = {
      ...props,
      isLoading: true,
    };
    const { container } = render(reduxWrapper(<IntlRecommendationsSmallLayoutPage {...props} />));

    const reactLoadingSkeleton = container.querySelector('.react-loading-skeleton');

    expect(reactLoadingSkeleton).toBeTruthy();
  });
});
