import { runSaga } from 'redux-saga';

import {
  resetPasswordBegin,
  resetPasswordSuccess,
  resetPasswordFailure,
  validateTokenBegin,
  validateTokenFailure,
} from '../actions';
import { handleResetPassword, handleValidateToken } from '../sagas';
import * as api from '../service';
import initializeMockLogging from '../../../setupTest';
import { INTERNAL_SERVER_ERROR } from '../../../data/constants';

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

  it('should call service and dispatch error action', async () => {
    const resetPassword = jest.spyOn(api, 'resetPassword')
      .mockImplementation(() => Promise.reject());

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleResetPassword,
      params,
    );

    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([resetPasswordBegin(), resetPasswordFailure(INTERNAL_SERVER_ERROR)]);
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
  });

  it('check server error on api failure', async () => {
    const validateToken = jest.spyOn(api, 'validateToken')
      .mockImplementation(() => Promise.reject());

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleValidateToken,
      params,
    );

    expect(validateToken).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([validateTokenBegin(), validateTokenFailure(INTERNAL_SERVER_ERROR)]);
  });
});
