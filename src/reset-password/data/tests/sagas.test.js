import { runSaga } from 'redux-saga';

import {
  resetPasswordBegin,
  resetPasswordSuccess,
  resetPasswordFailure,
} from '../actions';
import { handleResetPassword } from '../sagas';
import * as api from '../service';

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
    expect(dispatched).toEqual([resetPasswordBegin(), resetPasswordFailure()]);
    resetPassword.mockClear();
  });
});
