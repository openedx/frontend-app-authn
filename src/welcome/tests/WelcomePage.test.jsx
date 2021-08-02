import React from 'react';

import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import * as auth from '@edx/frontend-platform/auth';
import { injectIntl, IntlProvider, configure } from '@edx/frontend-platform/i18n';

import { saveUserProfile } from '../data/actions';
import WelcomePage from '../WelcomePage';

const IntlWelcomePage = injectIntl(WelcomePage);
const mockStore = configureStore();

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/analytics');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();
auth.configure = jest.fn();

auth.ensureAuthenticatedUser = jest.fn().mockImplementation(() => Promise.resolve((true)));
auth.hydrateAuthenticatedUser = jest.fn().mockImplementation(() => Promise.resolve((true)));

describe('WelcomePageTests', () => {
  mergeConfig({
    WELCOME_PAGE_SUPPORT_LINK: 'http://localhost:1999/welcome',
  });

  const registrationResult = { redirectUrl: 'http://localhost:18000/dashboard', success: true };
  const props = {
    location: {
      state: {
        registrationResult,
      },
    },
  };
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore({});
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, username: 'edX' }));
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
  });

  it('should submit user profile details on form submission', async () => {
    const formPayload = {
      year_of_birth: 1997,
      level_of_education: 'other',
      gender: 'm',
    };

    store.dispatch = jest.fn(store.dispatch);
    const welcomePage = mount(reduxWrapper(<IntlWelcomePage {...props} />));
    await act(async () => {
      await Promise.resolve(welcomePage);
      await new Promise(resolve => setImmediate(resolve));
      welcomePage.update();
    });

    welcomePage.find('select#gender').simulate('change', { target: { value: 'm', name: 'gender' } });
    welcomePage.find('select#yearOfBirth').simulate('change', { target: { value: 1997, name: 'yearOfBirth' } });
    welcomePage.find('select#levelOfEducation').simulate('change', { target: { value: 'other', name: 'levelOfEducation' } });

    welcomePage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).toHaveBeenCalledWith(saveUserProfile('edX', formPayload));
  });

  it('should open modal on pressing skip for now button', async () => {
    const welcomePage = mount(reduxWrapper(<IntlWelcomePage {...props} />));
    await act(async () => {
      await Promise.resolve(welcomePage);
      await new Promise(resolve => setImmediate(resolve));
      welcomePage.update();
    });

    welcomePage.find('button.btn-link').simulate('click');
    expect(welcomePage.find('.pgn__modal-content-container').exists()).toBeTruthy();
  });

  it('should show error message when patch request fails', async () => {
    store = mockStore({
      welcomePage: {
        showError: true,
      },
    });
    const welcomePage = mount(reduxWrapper(<IntlWelcomePage {...props} />));
    await act(async () => {
      await Promise.resolve(welcomePage);
      await new Promise(resolve => setImmediate(resolve));
      welcomePage.update();
    });
    expect(welcomePage.find('#welcome-page-errors').exists()).toBeTruthy();
  });
});
