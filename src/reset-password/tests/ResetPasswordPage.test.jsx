import React from 'react';
import { Provider } from 'react-redux';

import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { LOGIN_PAGE, RESET_PAGE } from '../../data/constants';
import { resetPassword, validateToken } from '../data/actions';
import {
  PASSWORD_RESET, PASSWORD_RESET_ERROR, SUCCESS, TOKEN_STATE,
} from '../data/constants';
import ResetPasswordPage from '../ResetPasswordPage';

const mockedNavigator = jest.fn();
const token = '1c-bmjdkc-5e60e084cf8113048ca7';

jest.mock('@edx/frontend-platform/auth');
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
  useParams: jest.fn().mockReturnValue({ token }),
}));

const IntlResetPasswordPage = injectIntl(ResetPasswordPage);
const mockStore = configureStore();

describe('ResetPasswordPage', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </IntlProvider>
  );

  const initialState = {
    register: {
      validationApiRateLimited: false,
    },
    resetPassword: {},
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
      resetPassword: jest.fn(),
      status: null,
      token: null,
      errors: null,
      match: {
        params: {},
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ******** form submission tests ********

  it('with valid inputs resetPassword action is dispatched', async () => {
    const password = 'test-password-1';

    store = mockStore({
      ...initialState,
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });

    jest.mock('@edx/frontend-platform/auth', () => ({
      getHttpClient: jest.fn(() => ({
        post: async () => ({
          data: {},
          catch: () => {},
        }),
      })),
    }));

    store.dispatch = jest.fn(store.dispatch);
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('input#newPassword').simulate('change', { target: { value: password, name: 'newPassword' } });
    resetPasswordPage.find('input#confirmPassword').simulate('change', { target: { value: password, name: 'confirmPassword' } });

    await act(async () => {
      await resetPasswordPage.find('button.btn-brand').simulate('click');
    });

    expect(store.dispatch).toHaveBeenCalledWith(
      resetPassword({ new_password1: password, new_password2: password }, props.token, {}),
    );
    resetPasswordPage.unmount();
  });

  // ******** test reset password field validations ********

  it('should show error messages for required fields on empty form submission', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage.find('button.btn-brand').simulate('click');

    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'We couldn\'t reset your password.Please check your responses and try again.',
    );
    expect(resetPasswordPage.find('div[feedback-for="newPassword"]').text()).toContain('Password criteria has not been met');
    expect(resetPasswordPage.find('div[feedback-for="confirmPassword"]').text()).toContain('Confirm your password');
    resetPasswordPage.find('input#newPassword').simulate('focus');
    expect(resetPasswordPage.find('div[feedback-for="newPassword"]').exists()).toBe(false);
    resetPasswordPage.find('input#confirmPassword').simulate('focus');
    expect(resetPasswordPage.find('div[feedback-for="confirmPassword"]').exists()).toBe(false);
  });

  it('should show error message when new and confirm password do not match', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    resetPasswordPage
      .find('input#confirmPassword')
      .simulate('change', { target: { value: 'password-mismatch', name: 'confirmPassword' } });

    expect(resetPasswordPage.find('div[feedback-for="confirmPassword"]').text()).toContain('Passwords do not match');
  });

  // ******** alert message tests ********

  it('should show reset password rate limit error', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: PASSWORD_RESET.FORBIDDEN_REQUEST,
      },
    });

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'Too many requests.An error has occurred because of too many requests. Please try again after some time.',
    );
  });

  it('should show reset password internal server error', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
      },
    });

    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('#validation-errors').first().text()).toEqual(
      'We couldn\'t reset your password.An error has occurred. Try refreshing the page, or check your internet connection.',
    );
  });

  // ******** miscellaneous tests ********

  it('should call validation on password field when blur event fires', () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const expectedText = 'Password criteria has not been metPassword must contain at least 8 characters, at least one letter, and at least one number';
    resetPasswordPage.find('input#newPassword').simulate('change', { target: { value: 'aziz156', name: 'newPassword' } });
    resetPasswordPage.find('input#newPassword').simulate('blur', { target: { value: 'aziz156', name: 'newPassword' } });
    expect(resetPasswordPage.find('div[feedback-for="newPassword"]').text()).toEqual(expectedText);
  });

  it('show spinner when api call is pending', () => {
    store.dispatch = jest.fn(store.dispatch);
    props = {
      status:
      TOKEN_STATE.PENDING,
    };
    mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(store.dispatch).toHaveBeenCalledWith(validateToken(token));
  });
  it('should redirect the user to Reset password email screen ', async () => {
    props = {
      status:
      PASSWORD_RESET_ERROR,
    };
    mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(mockedNavigator).toHaveBeenCalledWith(RESET_PAGE);
  });
  it('should redirect the user to root url of the application ', async () => {
    props = {
      status: SUCCESS,
    };
    mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(mockedNavigator).toHaveBeenCalledWith(LOGIN_PAGE);
  });

  it('show spinner during token validation', () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(resetPasswordPage.find('div.spinner-header')).toBeTruthy();
  });

  // ******** redirection tests ********

  it('by clicking on sign in tab should redirect onto login page', async () => {
    const resetPasswordPage = mount(reduxWrapper(<IntlResetPasswordPage {...props} />));

    await act(async () => { await resetPasswordPage.find('nav').find('a').first().simulate('click'); });

    resetPasswordPage.update();
    expect(mockedNavigator).toHaveBeenCalledWith(LOGIN_PAGE);
  });
});
