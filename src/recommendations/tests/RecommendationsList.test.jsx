import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';

import mockedProductData from './mockedData';
import RecommendationList from '../RecommendationsList';

const IntlRecommendationList = injectIntl(RecommendationList);
const mockStore = configureStore();

describe('RecommendationsListTests', () => {
  const store = mockStore({});
  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  it('should render the product card', () => {
    const props = {
      recommendations: mockedProductData,
      userId: 1234567,
    };

    const { container } = render(reduxWrapper(<IntlRecommendationList {...props} />));

    const recommendationCards = container.querySelectorAll('.recommendation-card');
    expect(recommendationCards.length).toEqual(mockedProductData.length);
  });

  it('should render the recommendations card with footer content', () => {
    const props = {
      recommendations: mockedProductData,
      userId: 1234567,
    };

    const { getByText } = render(reduxWrapper(<IntlRecommendationList {...props} />));

    const firstFooterContent = getByText('1 Course');
    const secondFooterContent = getByText('2 Courses');

    expect(firstFooterContent).toBeTruthy();
    expect(secondFooterContent).toBeTruthy();
  });
});
