import React from 'react';
import { Provider } from 'react-redux';

import { getConfig, mergeConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';
import * as auth from '@edx/frontend-platform/auth';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import * as logging from '@edx/frontend-platform/logging';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import configureStore from 'redux-mock-store';

import {
  COMPLETE_STATE, DEFAULT_REDIRECT_URL, FAILURE_STATE,
} from '../../data/constants';
import { saveUserProfile } from '../data/actions';
import ProgressiveProfiling from '../ProgressiveProfiling';

const IntlProgressiveProfilingPage = injectIntl(ProgressiveProfiling);
const mockStore = configureStore();

jest.mock('@edx/frontend-platform/analytics');
jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/logging');

analytics.sendTrackEvent = jest.fn();
analytics.sendPageEvent = jest.fn();
logging.getLoggingService = jest.fn();

auth.configure = jest.fn();
auth.ensureAuthenticatedUser = jest.fn().mockImplementation(() => Promise.resolve(true));
auth.hydrateAuthenticatedUser = jest.fn().mockImplementation(() => Promise.resolve(true));

describe('ProgressiveProfilingTests', () => {
  mergeConfig({
    WELCOME_PAGE_SUPPORT_LINK: 'http://localhost:1999/welcome',
  });
  const registrationResult = { redirectUrl: getConfig().LMS_BASE_URL + DEFAULT_REDIRECT_URL, success: true };
  const fields = {
    company: { name: 'company', type: 'text', label: 'Company' },
    gender: {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      options: [['m', 'Male'], ['f', 'Female'], ['o', 'Other/Prefer Not to Say']],
    },
  };
  const extendedProfile = ['company'];
  const optionalFields = { fields, extended_profile: extendedProfile };
  let props = {};
  let store = {};
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const initialState = {
    welcomePage: {
      formRenderState: COMPLETE_STATE,
    },
  };

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const getProgressiveProfilingPage = async () => {
    const progressiveProfilingPage = mount(reduxWrapper(<IntlProgressiveProfilingPage {...props} />));
    await act(async () => {
      await Promise.resolve(progressiveProfilingPage);
      await new Promise(resolve => setImmediate(resolve));
      progressiveProfilingPage.update();
    });

    return progressiveProfilingPage;
  };

  beforeEach(() => {
    store = mockStore(initialState);
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
    props = {
      getFieldData: jest.fn(),
      location: {
        state: {
          registrationResult,
          optionalFields,
        },
      },
    };
  });

  it('should render fields returned by backend api', async () => {
    const progressiveProfilingPage = await getProgressiveProfilingPage();
    expect(progressiveProfilingPage.find('#gender').exists()).toBeTruthy();
  });

  it('should submit user profile details on form submission', async () => {
    auth.getAuthenticatedUser = jest.fn(() => ({ userId: 3, username: 'abc123' }));
    const formPayload = {
      gender: 'm',
      extended_profile: [{ field_name: 'company', field_value: 'test company' }],
    };
    store.dispatch = jest.fn(store.dispatch);
    const progressiveProfilingPage = await getProgressiveProfilingPage();
    progressiveProfilingPage.find('select#gender').simulate('change', { target: { value: 'm', name: 'gender' } });
    progressiveProfilingPage.find('input#company').simulate('change', { target: { value: 'test company', name: 'company' } });

    progressiveProfilingPage.find('button.btn-brand').simulate('click');
    expect(store.dispatch).toHaveBeenCalledWith(saveUserProfile('abc123', formPayload));
  });

  it('should open modal on pressing skip for now button', async () => {
    const progressiveProfilingPage = await getProgressiveProfilingPage();

    progressiveProfilingPage.find('button.btn-link').simulate('click');
    expect(progressiveProfilingPage.find('.pgn__modal-content-container').exists()).toBeTruthy();
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.skip.link.clicked');
  });

  it('should send analytic event for support link click', async () => {
    const progressiveProfilingPage = await getProgressiveProfilingPage();

    progressiveProfilingPage.find('.progressive-profiling-support a[target="_blank"]').simulate('click');
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith('edx.bi.welcome.page.support.link.clicked');
  });

  it('should show error message when patch request fails', async () => {
    store = mockStore({
      welcomePage: {
        ...initialState.welcomePage,
        showError: true,
      },
    });

    const progressiveProfilingPage = await getProgressiveProfilingPage();
    expect(progressiveProfilingPage.find('#pp-page-errors').exists()).toBeTruthy();
  });

  it('should redirect to dashboard if no form fields are configured', async () => {
    store = mockStore({
      welcomePage: {
        formRenderState: FAILURE_STATE,
      },
    });

    delete window.location;
    window.location = {
      href: getConfig().BASE_URL,
      assign: jest.fn().mockImplementation((value) => { window.location.href = value; }),
    };
    await getProgressiveProfilingPage();
    expect(window.location.href).toBe(DASHBOARD_URL);
  });
});
