import React from 'react';
import { Provider } from 'react-redux';

import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
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

    const recommendationsList = mount(reduxWrapper(<IntlRecommendationList {...props} />));
    expect(recommendationsList.find('.recommendation-card').length).toEqual(mockedProductData.length);
  });

  it('should render the recommendations card with footer content', () => {
    const props = {
      recommendations: mockedProductData,
      userId: 1234567,
    };

    const recommendationsList = mount(reduxWrapper(<IntlRecommendationList {...props} />));
    expect(recommendationsList.find('.x-small').at(0).text()).toEqual('1 Course');
    expect(recommendationsList.find('.x-small').at(1).text()).toEqual('2 Courses');
  });
});
