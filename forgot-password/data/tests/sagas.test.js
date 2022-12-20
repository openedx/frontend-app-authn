import { runSaga } from 'redux-saga';

import initializeMockLogging from '../../../setupTest';
import * as actions from '../actions';
import { handleForgotPassword } from '../sagas';
import * as api from '../service';

const { loggingService } = initializeMockLogging();

describe('handleForgotPassword', () => {
  const params = {
    payload: {
      forgotPasswordFormData: {
        email: 'test@test.com',
      },
    },
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('should handle 500 error code', async () => {
    const passwordErrorResponse = { response: { status: 500 } };

    const forgotPasswordRequest = jest.spyOn(api, 'forgotPassword').mockImplementation(
      () => Promise.reject(passwordErrorResponse),
    );

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleForgotPassword,
      params,
    );

    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.forgotPasswordBegin(),
      actions.forgotPasswordServerError(),
    ]);
    forgotPasswordRequest.mockClear();
  });

  it('should handle rate limit error', async () => {
    const forbiddenErrorResponse = { response: { status: 403 } };

    const forbiddenPasswordRequest = jest.spyOn(api, 'forgotPassword').mockImplementation(
      () => Promise.reject(forbiddenErrorResponse),
    );

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleForgotPassword,
      params,
    );

    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.forgotPasswordBegin(),
      actions.forgotPasswordForbidden(null),
    ]);
    forbiddenPasswordRequest.mockClear();
  });
});
