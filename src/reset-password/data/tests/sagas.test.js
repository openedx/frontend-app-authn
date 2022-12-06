import { runSaga } from 'redux-saga';

import initializeMockLogging from '../../../setupTest';
import {
  passwordResetFailure,
  resetPasswordBegin,
  resetPasswordFailure,
  resetPasswordSuccess, validateTokenBegin,
} from '../actions';
import { PASSWORD_RESET } from '../constants';
import { handleResetPassword, handleValidateToken } from '../sagas';
import * as api from '../service';

const { loggingService } = initializeMockLogging();

describe('handleResetPassword', () => {
  const params = {
    payload: {
      formPayload: {
        new_password1: 'new_password1',
        new_password2: 'new_password1',
      },
      token: 'token',
      params: {},
    },
  };

  const responseData = {
    reset_status: true,
    err_msg: '',
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('should call service and dispatch success action', async () => {
    const resetPassword = jest.spyOn(api, 'resetPassword')
      .mockImplementation(() => Promise.resolve(responseData));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleResetPassword,
      params,
    );

    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([resetPasswordBegin(), resetPasswordSuccess(true)]);
    resetPassword.mockClear();
  });

  it('should call service and dispatch internal server error action', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
        },
      },
    };
    const resetPassword = jest.spyOn(api, 'resetPassword')
      .mockImplementation(() => Promise.reject(errorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleResetPassword,
      params,
    );

    expect(loggingService.logError).toHaveBeenCalled();
    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([resetPasswordBegin(), resetPasswordFailure(PASSWORD_RESET.INTERNAL_SERVER_ERROR)]);
    resetPassword.mockClear();
  });

  it('should call service and dispatch invalid token error', async () => {
    responseData.reset_status = false;
    responseData.token_invalid = true;

    const resetPassword = jest.spyOn(api, 'resetPassword')
      .mockImplementation(() => Promise.resolve(responseData));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleResetPassword,
      params,
    );

    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([resetPasswordBegin(), passwordResetFailure(PASSWORD_RESET.INVALID_TOKEN)]);
    resetPassword.mockClear();
  });

  it('should call service and dispatch ratelimit error', async () => {
    const errorResponse = {
      response: {
        status: 429,
        data: {
          errorCode: PASSWORD_RESET.FORBIDDEN_REQUEST,
        },
      },
    };
    const resetPassword = jest.spyOn(api, 'resetPassword')
      .mockImplementation(() => Promise.reject(errorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleResetPassword,
      params,
    );

    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([resetPasswordBegin(), resetPasswordFailure(PASSWORD_RESET.FORBIDDEN_REQUEST)]);
    resetPassword.mockClear();
  });
});

describe('handleValidateToken', () => {
  const params = {
    payload: {
      token: 'token',
      params: {},
    },
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('check internal server error on api failure', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: PASSWORD_RESET.INTERNAL_SERVER_ERROR,
        },
      },
    };
    const validateToken = jest.spyOn(api, 'validateToken')
      .mockImplementation(() => Promise.reject(errorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleValidateToken,
      params,
    );

    expect(validateToken).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([validateTokenBegin(), passwordResetFailure(PASSWORD_RESET.INTERNAL_SERVER_ERROR)]);
    validateToken.mockClear();
  });

  it('should call service and dispatch rate limit error', async () => {
    const errorResponse = {
      response: {
        status: 429,
        data: {
          errorCode: PASSWORD_RESET.FORBIDDEN_REQUEST,
        },
      },
    };
    const validateToken = jest.spyOn(api, 'validateToken')
      .mockImplementation(() => Promise.reject(errorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleValidateToken,
      params,
    );

    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(validateToken).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([validateTokenBegin(), passwordResetFailure(PASSWORD_RESET.FORBIDDEN_REQUEST)]);
    validateToken.mockClear();
  });
});
