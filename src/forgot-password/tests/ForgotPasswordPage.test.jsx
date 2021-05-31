import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import * as analytics from '@edx/frontend-platform/analytics';

import ForgotPasswordPage from '../ForgotPasswordPage';
import { INTERNAL_SERVER_ERROR } from '../../data/constants';

jest.mock('@edx/frontend-platform/analytics');

analytics.sendPageEvent = jest.fn();

const IntlForgotPasswordPage = injectIntl(ForgotPasswordPage);
const mockStore = configureStore();
const initialState = {
  forgotPassword: {
    status: null,
  },
};

describe('ForgotPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  beforeEach(() => {
    store = mockStore(initialState);
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

  it('should display need other help signing in button', () => {
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('#forgot-password.btn-link').first().text()).toEqual('Need help signing in?');
  });

  it('should display email validation error message', async () => {
    const validationMessage = 'We were unable to contact you.Enter a valid email address below.';
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    wrapper.find('input#email').simulate(
      'change', { target: { value: 'invalid-email', name: 'email' } },
    );
    await act(async () => { await wrapper.find('button.btn-brand').simulate('click'); });
    wrapper.update();

    expect(wrapper.find('.alert-danger').text()).toEqual(validationMessage);
  });

  it('should show alert on server error', () => {
    store = mockStore({
      forgotPassword: { status: INTERNAL_SERVER_ERROR },
    });
    const expectedMessage = 'We were unable to contact you.'
                            + 'An error has occurred. Try refreshing the page, or check your internet connection.';
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    expect(wrapper.find('#internal-server-error').first().text()).toEqual(expectedMessage);
  });

  it('should display empty email validation message', async () => {
    const validationMessage = 'We were unable to contact you.Enter your email below.';
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    await act(async () => { await forgotPasswordPage.find('button.btn-brand').simulate('click'); });

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

    const emailInput = forgotPasswordPage.find('input#email');
    emailInput.simulate('change', { target: { value: 'invalid-email', name: 'email' } });
    forgotPasswordPage.update();

    expect(forgotPasswordPage.find('#email-invalid-feedback').exists()).toEqual(false);
  });

  it('should display error message on blur event', async () => {
    const validationMessage = 'Enter your email';
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    const emailInput = forgotPasswordPage.find('input#email');

    await act(async () => {
      await emailInput.simulate('blur', { target: { value: '', name: 'email' } });
    });

    forgotPasswordPage.update();
    expect(forgotPasswordPage.find('.pgn__form-text-invalid').text()).toEqual(validationMessage);
  });

  it('check cookie rendered', () => {
    const forgotPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(forgotPage.find(<CookiePolicyBanner />)).toBeTruthy();
  });

  it('should display success message after email is sent', async () => {
    store = mockStore({
      ...initialState,
      forgotPassword: {
        status: 'complete',
      },
    });
    const successMessage = 'Check your emailWe sent an email to  with instructions to reset your password. If you do not '
                           + 'receive a password reset message after 1 minute, verify that you entered the correct email address,'
                           + ' or check your spam folder. If you need further assistance, contact technical support.';

    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('.alert-success').text()).toEqual(successMessage);
  });
});
