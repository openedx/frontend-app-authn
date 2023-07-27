import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import configureStore from 'redux-mock-store';

import { DEFAULT_REDIRECT_URL } from '../../data/constants';
import getPersonalizedRecommendations from '../data/service';
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
    const recommendationsPage = await getRecommendationsPage(props);
    recommendationsPage.find('.pgn__stateful-btn-state-default').first().simulate('click');
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  it('should change the option when click the dropdown option', async () => {
    const recommendationsPage = await getRecommendationsPage();

    recommendationsPage.find('#dropdown-basic-button').at(1).simulate('click');
    recommendationsPage.find('.dropdown-item').at(0).simulate('click',
      { target: { title: 'Trending courses', value: 'trending' } });
    expect(recommendationsPage.find('#dropdown-basic-button').at(1).text()).toEqual('Trending Courses');
  });

  it('should redirect if recommended courses count is less than RECOMMENDATIONS_COUNT', async () => {
    delete window.location;
    window.location = { assign: jest.fn() };
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeTruthy();
  });

  it('redirects to dashboard if user tries to access the page directly', async () => {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    delete window.location;
    window.location = {
      href: getConfig().BASE_URL,
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
    };

    await getRecommendationsPage({});

    expect(getPersonalizedRecommendations).toHaveBeenCalledTimes(0);
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });
});
