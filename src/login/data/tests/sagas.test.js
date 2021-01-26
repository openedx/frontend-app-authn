import { runSaga } from 'redux-saga';

import { camelCaseObject } from '@edx/frontend-platform';

import * as actions from '../actions';
import { handleLoginRequest } from '../sagas';
import * as api from '../service';
import initializeMockLogging from '../../../setupTest';

const { loggingService } = initializeMockLogging();

describe('handleLoginRequest', () => {
  const params = {
    payload: {
      formData: {
        email: 'test@test.com',
        password: 'test-password',
      },
    },
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
  });

  it('should call service and dispatch success action', async () => {
    const data = { redirectUrl: '/dashboard', success: true };
    const loginRequest = jest.spyOn(api, 'loginRequest')
      .mockImplementation(() => Promise.resolve(data));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleLoginRequest,
      params,
    );

    expect(loginRequest).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([
      actions.loginRequestBegin(),
      actions.loginRequestSuccess(data.redirectUrl, data.success),
    ]);
    loginRequest.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const loginErrorResponse = {
      response: {
        status: 400,
        data: {
          login_error: 'something went wrong',
        },
      },
    };
    const loginRequest = jest.spyOn(api, 'loginRequest')
      .mockImplementation(() => Promise.reject(loginErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleLoginRequest,
      params,
    );

    expect(loginRequest).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.loginRequestBegin(),
      actions.loginRequestFailure(camelCaseObject(loginErrorResponse.response.data)),
    ]);
    loginRequest.mockClear();
  });

  it('should handle 500 error code', async () => {
    const loginErrorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: 'internal-server-error',
        },
      },
    };

    const loginRequest = jest.spyOn(api, 'loginRequest').mockImplementation(() => Promise.reject(loginErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleLoginRequest,
      params,
    );

    expect(dispatched).toEqual([
      actions.loginRequestBegin(),
      actions.loginRequestFailure(camelCaseObject(loginErrorResponse.response.data)),
    ]);
    loginRequest.mockClear();
  });
});
