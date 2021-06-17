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

import ForgotPasswordPage from '../ForgotPasswordPage';
import { INTERNAL_SERVER_ERROR } from '../../data/constants';

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
    const validationMessage = "We couldn’t send the password recovery email.The email address you've provided isn't formatted correctly.";
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    wrapper.find('input#forgot-password-input').simulate(
      'change', { target: { value: 'invalid-email', name: 'email' } },
    );
    await act(async () => { await wrapper.find('button.btn-primary').simulate('click'); });
    wrapper.update();

    expect(wrapper.find('.alert-danger').text()).toEqual(validationMessage);
  });

  it('should show alert on server error', () => {
    props = {
      ...props,
      status: INTERNAL_SERVER_ERROR,
    };
    const expectedMessage = 'We couldn’t send the password recovery email.'
                            + 'An error has occurred. Try refreshing the page, or check your internet connection.';
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    expect(wrapper.find('#internal-server-error').first().text()).toEqual(expectedMessage);
  });

  it('should display empty email validation message', async () => {
    const validationMessage = 'We couldn’t send the password recovery email.Please enter your email.';
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    await act(async () => { await forgotPasswordPage.find('button.btn-primary').simulate('click'); });

    forgotPasswordPage.update();
    expect(forgotPasswordPage.find('.alert-danger').text()).toEqual(validationMessage);
  });

  it('should display request in progress error message', () => {
    const rateLimitMessage = 'An error occurred.Your previous request is in progress, please try again in a few moments.';
    store = mockStore({
      forgotPassword: { status: 'forbidden' },
    });

    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(forgotPasswordPage.find('.alert-danger').text()).toEqual(rateLimitMessage);
  });

  it('should not display any error message on change event', () => {
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    const emailInput = forgotPasswordPage.find('input#forgot-password-input');
    emailInput.simulate('change', { target: { value: 'invalid-email', name: 'email' } });
    forgotPasswordPage.update();

    expect(forgotPasswordPage.find('#email-invalid-feedback').exists()).toEqual(false);
  });

  it('should display error message on blur event', async () => {
    const validationMessage = 'Please enter your email.';
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    const emailInput = forgotPasswordPage.find('input#forgot-password-input');

    await act(async () => {
      await emailInput.simulate('blur', { target: { value: '', name: 'email' } });
    });

    forgotPasswordPage.update();
    expect(forgotPasswordPage.find('#forgot-password-input-invalid-feedback').text()).toEqual(validationMessage);
  });

  it('check cookie rendered', () => {
    const forgotPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(forgotPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });
});
