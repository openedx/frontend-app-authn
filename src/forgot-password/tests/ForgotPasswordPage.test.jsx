import React from 'react';
import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { INTERNAL_SERVER_ERROR, LOGIN_PAGE } from '../../data/constants';
import { PASSWORD_RESET } from '../../reset-password/data/constants';
import { setForgotPasswordFormData } from '../data/actions';
import ForgotPasswordPage from '../ForgotPasswordPage';

const mockedNavigator = jest.fn();

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendPageEvent: jest.fn(),
  sendTrackEvent: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
}));

const IntlForgotPasswordPage = injectIntl(ForgotPasswordPage);
const mockStore = configureStore();

const initialState = {
  forgotPassword: {
    status: '',
  },
};

describe('ForgotPasswordPage', () => {
  mergeConfig({
    LOGIN_ISSUE_SUPPORT_LINK: '',
    INFO_EMAIL: '',
  });

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
    jest.mock('@edx/frontend-platform/auth', () => ({
      getAuthenticatedUser: jest.fn(() => ({
        userId: 3,
        username: 'test-user',
      })),
    }));
    configure({
      loggingService: { logError: jest.fn() },
      config: {
        ENVIRONMENT: 'production',
        LANGUAGE_PREFERENCE_COOKIE_NAME: 'yum',
      },
      messages: { 'es-419': {}, de: {}, 'en-us': {} },
    });
    props = {
      forgotPassword: jest.fn(),
      status: null,
    };
  });

  it('not should display need other help signing in button', () => {
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('#forgot-password').exists()).toBeFalsy();
  });

  it('should display need other help signing in button', () => {
    mergeConfig({
      LOGIN_ISSUE_SUPPORT_LINK: '/support',
    });
    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('#forgot-password').first().text()).toEqual('Need help signing in?');
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

    expect(wrapper.find('#validation-errors').first().text()).toEqual(expectedMessage);
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

  it('should set error in redux store on onBlur', () => {
    const forgotPasswordFormData = {
      email: 'test@gmail',
      emailValidationError: 'Enter a valid email address',
    };

    props = {
      ...props,
      email: 'test@gmail',
      emailValidationError: '',
    };

    store.dispatch = jest.fn(store.dispatch);
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    forgotPasswordPage.find('input#email').simulate('blur');
    expect(store.dispatch).toHaveBeenCalledWith(setForgotPasswordFormData(forgotPasswordFormData));
  });

  it('should display error message if available in props', async () => {
    const validationMessage = 'Enter your email';
    props = {
      ...props,
      emailValidationError: validationMessage,
      email: '',
    };
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    forgotPasswordPage.update();
    expect(forgotPasswordPage.find('.pgn__form-text-invalid').text()).toEqual(validationMessage);
  });

  it('should clear error in redux store on onFocus', () => {
    const forgotPasswordFormData = {
      emailValidationError: '',
    };

    props = {
      ...props,
      email: 'test@gmail',
      emailValidationError: 'Enter a valid email address',
    };

    store.dispatch = jest.fn(store.dispatch);
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    forgotPasswordPage.find('input#email').simulate('focus');
    expect(store.dispatch).toHaveBeenCalledWith(setForgotPasswordFormData(forgotPasswordFormData));
  });

  it('should clear error message when cleared in props on focus', async () => {
    props = {
      ...props,
      emailValidationError: '',
      email: '',
    };
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    forgotPasswordPage.update();
    expect(forgotPasswordPage.find('#email-invalid-feedback').exists()).toEqual(false);
  });

  it('should display success message after email is sent', () => {
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

  it('should display invalid password reset link error', () => {
    store = mockStore({
      ...initialState,
      forgotPassword: {
        status: PASSWORD_RESET.INVALID_TOKEN,
      },
    });
    const successMessage = 'Invalid password reset link'
                            + 'This password reset link is invalid. It may have been used already. '
                            + 'Enter your email below to receive a new link.';

    const wrapper = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));
    expect(wrapper.find('.alert-danger').text()).toEqual(successMessage);
  });

  it('should redirect onto login page', async () => {
    const forgotPasswordPage = mount(reduxWrapper(<IntlForgotPasswordPage {...props} />));

    await act(async () => { await forgotPasswordPage.find('nav').find('a').first().simulate('click'); });

    forgotPasswordPage.update();
    expect(mockedNavigator).toHaveBeenCalledWith(LOGIN_PAGE);
  });
});
