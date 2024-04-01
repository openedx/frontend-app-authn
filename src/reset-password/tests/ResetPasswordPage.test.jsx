import React from 'react';
import { Provider } from 'react-redux';

import { configure, injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  fireEvent, render, screen,
} from '@testing-library/react';
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
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const newPasswordInput = screen.getByLabelText('New password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    fireEvent.change(newPasswordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, { target: { value: password } });

    const resetPasswordButton = screen.getByRole('button', { name: /Reset password/i, id: 'submit-new-password' });
    await act(async () => {
      fireEvent.click(resetPasswordButton);
    });
    expect(store.dispatch).toHaveBeenCalledWith(
      resetPassword({ new_password1: password, new_password2: password }, props.token, {}),
    );
  });

  // ******** test reset password field validations ********

  it('should show error messages for required fields on empty form submission', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const resetPasswordButton = screen.getByRole('button', { name: /Reset password/i, id: 'submit-new-password' });
    fireEvent.click(resetPasswordButton);

    expect(screen.queryByText(/We couldn't reset your password./i)).toBeTruthy();
    expect(screen.queryByText('Password criteria has not been met')).toBeTruthy();
    expect(screen.queryByText('Confirm your password')).toBeTruthy();

    const newPasswordInput = screen.getByLabelText('New password');
    fireEvent.focus(newPasswordInput);
    expect(screen.queryByText('Password criteria has not been met')).toBeNull();

    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    fireEvent.focus(confirmPasswordInput);
    expect(screen.queryByText('Confirm your password')).toBeNull();
  });

  it('should show error message when new and confirm password do not match', () => {
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: TOKEN_STATE.VALID,
      },
    });
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    fireEvent.change(confirmPasswordInput, { target: { value: 'password-mismatch' } });

    const passwordsDoNotMatchError = screen.queryByText('Passwords do not match');
    expect(passwordsDoNotMatchError).toBeTruthy();
  });

  // ******** alert message tests ********

  it('should show reset password rate limit error', () => {
    const validationMessage = 'Too many requests.An error has occurred because of too many requests. Please try again after some time.';
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: PASSWORD_RESET.FORBIDDEN_REQUEST,
      },
    });

    const { container } = render(reduxWrapper(<IntlResetPasswordPage {...props} />));

    const alertElements = container.querySelectorAll('.alert-danger');
    const rateLimitError = alertElements[0].textContent;
    expect(rateLimitError).toBe(validationMessage);
  });

  it('should show reset password internal server error', () => {
    const validationMessage = 'We couldn\'t reset your password.An error has occurred. Try refreshing the page, or check your internet connection.';
    store = mockStore({
      ...initialState,
      resetPassword: {
        status: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
      },
    });

    const { container } = render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const alertElements = container.querySelectorAll('.alert-danger');
    const internalServerError = alertElements[0].textContent;
    expect(internalServerError).toBe(validationMessage);
  });

  // ******** miscellaneous tests ********

  it('should call validation on password field when blur event fires', () => {
    const resetPasswordPage = render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const expectedText = 'Password criteria has not been metPassword must contain at least 8 characters, at least one letter, and at least one number';
    const newPasswordInput = resetPasswordPage.container.querySelector('input#newPassword');
    newPasswordInput.value = 'test-password';
    fireEvent.change(newPasswordInput);

    fireEvent.blur(newPasswordInput);

    const feedbackDiv = resetPasswordPage.container.querySelector('div[feedback-for="newPassword"]');
    expect(feedbackDiv.textContent).toEqual(expectedText);
  });

  it('show spinner when api call is pending', () => {
    store.dispatch = jest.fn(store.dispatch);
    props = {
      status:
      TOKEN_STATE.PENDING,
    };

    render(reduxWrapper(<IntlResetPasswordPage {...props} />));

    expect(store.dispatch).toHaveBeenCalledWith(validateToken(token));
  });
  it('should redirect the user to Reset password email screen ', async () => {
    props = {
      status:
      PASSWORD_RESET_ERROR,
    };
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(mockedNavigator).toHaveBeenCalledWith(RESET_PAGE);
  });
  it('should redirect the user to root url of the application ', async () => {
    props = {
      status: SUCCESS,
    };
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    expect(mockedNavigator).toHaveBeenCalledWith(LOGIN_PAGE);
  });

  it('shows spinner during token validation', () => {
    render(reduxWrapper(<IntlResetPasswordPage {...props} />));
    const spinnerElement = document.getElementsByClassName('div.spinner-header');

    expect(spinnerElement).toBeTruthy();
  });

  // ******** redirection tests ********

  it('by clicking on sign in tab should redirect onto login page', async () => {
    const { getByText } = render(reduxWrapper(<IntlResetPasswordPage {...props} />));

    const signInTab = getByText('Sign in');

    fireEvent.click(signInTab);

    expect(mockedNavigator).toHaveBeenCalledWith(LOGIN_PAGE);
  });
});
