import React from 'react';
import { Provider } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import configureStore from 'redux-mock-store';

import { DEFAULT_REDIRECT_URL } from '../../data/constants';
import * as getPersonalizedRecommendations from '../data/service';
import RecommendationsPage from '../RecommendationsPage';

const IntlRecommendationsPage = injectIntl(RecommendationsPage);
const mockStore = configureStore();

jest.mock('../data/service');

describe('RecommendationsPageTests', () => {
  let defaultProps = {};
  let store = {};

  const mockedResponse = [
    {
      title: 'How to Learn Online 1',
      marketingUrl: 'https://test-recommendations.com/course/how-to-learn-online-1',
      cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-1.png',
      activeRunKey: 'course-v1:test+testX+2018',
      owners: [
        {
          key: 'firstOwnerX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-1.png',
          name: 'first owner',
        },
        {
          key: 'secondOwnerX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-1.png',
          name: 'second owner',
        },
      ],
      objectId: 'course-how-to-learn-online-key-1',
    },
    {
      title: 'How to Learn Online 2',
      marketingUrl: 'https://test-recommendations.com/course/how-to-learn-online-2',
      cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-2.png',
      activeRunKey: 'course-v1:test+testX+2019',
      owners: [
        {
          key: 'testX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-2.png',
          name: 'test',
        },
      ],
      objectId: 'course-how-to-learn-online-key-2',
    },
    {
      title: 'How to Learn Online 3',
      marketingUrl: 'https://test-recommendations.com/course/how-to-learn-online-3',
      cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-3.png',
      activeRunKey: 'course-v1:test+testX+2020',
      owners: [
        {
          key: 'testX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-3.png',
          name: 'test',
        },
      ],
      objectId: 'course-how-to-learn-online-key-3',
    },
    {
      title: 'How to Learn Online 4',
      marketingUrl: 'https://test-recommendations.com/course/how-to-learn-online-4',
      cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-4.png',
      activeRunKey: 'course-v1:test+testX+2021',
      owners: [
        {
          key: 'testX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-4.png',
          name: 'test',
        },
      ],
      objectId: 'course-how-to-learn-online-key-4',
    },
    {
      title: 'How to Learn Online 5',
      marketingUrl: 'https://test-recommendations.com/course/how-to-learn-online-5',
      cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-5.png',
      activeRunKey: 'course-v1:test+testX+2022',
      owners: [
        {
          key: 'testX',
          logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-5.png',
          name: 'test',
        },
      ],
      objectId: 'course-how-to-learn-online-key-5',
    },
  ];

  const registrationResult = {
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
        },
      },
    };
  });

  it('redirects to dashboard if user tries to access the page directly', async () => {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    delete window.location;
    window.location = {
      href: getConfig().BASE_URL,
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
    };
    getPersonalizedRecommendations.default = jest.fn().mockImplementation(() => Promise.resolve([]));
    await getRecommendationsPage({});

    expect(getPersonalizedRecommendations.default).toHaveBeenCalledTimes(0);
    expect(window.location.href).toEqual(DASHBOARD_URL);
  });

  it('should call getPersonalizedRecommendations', async () => {
    delete window.location;
    window.location = { assign: jest.fn() };
    getPersonalizedRecommendations.default = jest.fn().mockImplementation(() => Promise.resolve([]));
    await getRecommendationsPage();

    expect(getPersonalizedRecommendations.default).toHaveBeenCalledTimes(1);
  });

  it('should display recommendations returned by Algolia', async () => {
    getPersonalizedRecommendations.default = jest.fn().mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeTruthy();
  });

  it('should redirect if recommended courses count is less than RECOMMENDATIONS_COUNT', async () => {
    delete window.location;
    window.location = { assign: jest.fn() };
    getPersonalizedRecommendations.default = jest.fn().mockImplementation(() => Promise.resolve([mockedResponse[0]]));
    const recommendationsPage = await getRecommendationsPage();

    expect(recommendationsPage.find('#course-recommendations').exists()).toBeFalsy();
    expect(window.location.href).toEqual(registrationResult.redirectUrl);
  });

  it('should display all owners for a course', async () => {
    getPersonalizedRecommendations.default = jest.fn().mockImplementation(() => Promise.resolve(mockedResponse));
    const recommendationsPage = await getRecommendationsPage();

    expect(
      recommendationsPage.find('.pgn__card-header-subtitle-md').getElements()[0].props.children,
    ).toEqual('firstOwnerX, secondOwnerX');
  });
});
