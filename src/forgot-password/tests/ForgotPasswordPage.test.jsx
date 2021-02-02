import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import * as analytics from '@edx/frontend-platform/analytics';

import { runSaga } from 'redux-saga';
import ForgotPasswordPage from '../ForgotPasswordPage';
import * as api from '../data/service';

import { handleForgotPassword } from '../data/sagas';
import * as actions from '../data/actions';
import { INTERNAL_SERVER_ERROR } from '../../login/data/constants';

jest.mock('../data/selectors', () => jest.fn().mockImplementation(() => ({ forgotPasswordSelector: () => ({}) })));
jest.mock('@edx/frontend-platform/analytics');

analytics.sendPageEvent = jest.fn();

const IntlForgotPasswordPage = injectIntl(ForgotPasswordPage);
const mockStore = configureStore();
const history = createMemoryHistory();

describe('ForgotPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore();
    props = {
      forgotPassword: jest.fn(),
      status: null,
    };
  });

  it('should match default section snapshot', () => {
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match forbidden section snapshot', () => {
    props = {
      ...props,
      status: 'forbidden',
    };
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match pending section snapshot', () => {
    props = {
      ...props,
      status: 'pending',
    };
    const tree = renderer.create(reduxWrapper(<IntlForgotPasswordPage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should match success section snapshot', () => {
    props = {
      ...props,
      status: 'complete',
    };
    renderer.create(
      reduxWrapper(
        <Router history={history}>
          <IntlForgotPasswordPage {...props} />
        </Router>,
      ),
    );
    expect(history.location.pathname).toEqual('/login');
  });

  it('should display need other help signing in button', () => {
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('button.field-link').first().text()).toEqual('Need other help signing in?');
  });

  it('should display email validation error message', async () => {
    const validationMessage = "The email address you've provided isn't formatted correctly.";
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    await act(async () => {
      await wrapper.find('button.btn-primary').simulate('click', { target: { value: 'random', name: 'email' } });
    });
    wrapper.update();
    expect(wrapper.find('#email-invalid-feedback').text()).toEqual(validationMessage);
  });

  it('should display alert banner incase of invalid email', async () => {
    const validationMessage = "An error occurred.The email address you've provided isn't formatted correctly.";
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    await act(async () => {
      await wrapper.find('button.btn-primary').simulate('click', { target: { value: 'random', name: 'email' } });
    });
    wrapper.update();
    expect(wrapper.find('.alert-danger').text()).toEqual(validationMessage);
  });

  it('should handle 500 error code', async () => {
    const params = {
      payload: {
        formData: {
          email: 'test@test.com',
        },
      },
    };
    const passwordErrorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: 'internal-server-error',
        },
      },
    };

    const forgotPasswordRequest = jest.spyOn(api, 'forgotPassword').mockImplementation(() => Promise.reject(passwordErrorResponse));
    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleForgotPassword,
      params,
    );

    expect(dispatched).toEqual([
      actions.forgotPasswordBegin(),
      actions.forgotPasswordServerError(),
    ]);
    forgotPasswordRequest.mockClear();
  });

  it('should handle 403 error code', async () => {
    const params = {
      payload: {
        formData: {
          email: 'test@test.com',
        },
      },
    };
    const forbiddenErrorResponse = {
      response: {
        status: 403,
        data: {
          msg: 'forbidden request',
        },
      },
    };

    const forbiddenPasswordRequest = jest.spyOn(api, 'forgotPassword').mockImplementation(() => Promise.reject(forbiddenErrorResponse));
    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleForgotPassword,
      params,
    );

    expect(dispatched).toEqual([
      actions.forgotPasswordBegin(),
      actions.forgotPasswordForbidden(null),
    ]);
    forbiddenPasswordRequest.mockClear();
  });

  it('should show alert on server error', () => {
    props = {
      ...props,
      status: INTERNAL_SERVER_ERROR,
    };
    const expectedMessage = 'Failed to Send Forgot Password Email';
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    expect(wrapper.find('div.alert-heading').text()).toEqual(expectedMessage);
  });

  it('check cookie rendered', () => {
    const forgotPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(forgotPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });
});
