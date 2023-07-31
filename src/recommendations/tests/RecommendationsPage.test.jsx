import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import { DEFAULT_REDIRECT_URL } from '../../data/constants';
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

describe('RecommendationsPageTests', () => {
  mergeConfig({
    GENERAL_RECOMMENDATIONS: '[]',
    POPULAR_PRODUCTS: '[]',
    TRENDING_PRODUCTS: '[]',
  });

  let defaultProps = {};
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

  beforeEach(() => {
    store = mockStore({
      register: {
        backendCountryCode: 'PK',
      },
    });
    defaultProps = {
      location: {
        state: {
          registrationResult,
          userId: 111,
        },
      },
    };
  });

  it('should redirect to dashboard if user is not coming from registration workflow', () => {
    mount(reduxWrapper(<IntlRecommendationsPage />));
    expect(window.location.href).toEqual(dashboardUrl);
  });

  it('should redirect if either popular or trending recommendations are not configured', () => {
    mount(reduxWrapper(<IntlRecommendationsPage {...defaultProps} />));
    expect(window.location.href).toEqual(redirectUrl);
  });

  it('should redirect user if they click "Skip for now" button', () => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage {...defaultProps} />));
    recommendationsPage.find('.pgn__stateful-btn-state-default').first().simulate('click');

    expect(window.location.href).toEqual(redirectUrl);
  });

  it('displays popular products as default recommendations', () => {
    const recommendationsPage = mount(reduxWrapper(<IntlRecommendationsPage {...defaultProps} />));
    expect(recommendationsPage.find('.nav-link .active a').text()).toEqual('Most Popular');
  });
});
