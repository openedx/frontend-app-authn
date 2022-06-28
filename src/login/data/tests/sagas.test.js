import { camelCaseObject } from '@edx/frontend-platform';
import { runSaga } from 'redux-saga';

import initializeMockLogging from '../../../setupTest';
import * as actions from '../actions';
import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR } from '../constants';
import { handleLoginRequest } from '../sagas';
import * as api from '../service';

const { loggingService } = initializeMockLogging();

describe('handleLoginRequest', () => {
  const params = {
    payload: {
      loginFormData: {
        email: 'test@test.com',
        password: 'test-password',
      },
    },
  };

  const testErrorResponse = async (loginErrorResponse, expectedLogFunc, expectedDispatchers) => {
    const loginRequest = jest.spyOn(api, 'loginRequest').mockImplementation(() => Promise.reject(loginErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleLoginRequest,
      params,
    );

    expect(loginRequest).toHaveBeenCalledTimes(1);
    expect(expectedLogFunc).toHaveBeenCalled();
    expect(dispatched).toEqual(expectedDispatchers);
    loginRequest.mockClear();
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
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

    await testErrorResponse(loginErrorResponse, loggingService.logInfo, [
      actions.loginRequestBegin(),
      actions.loginRequestFailure(camelCaseObject(loginErrorResponse.response.data)),
    ]);
  });

  it('should handle rate limit error code', async () => {
    const loginErrorResponse = {
      response: {
        status: 403,
        data: {
          errorCode: FORBIDDEN_REQUEST,
        },
      },
    };

    await testErrorResponse(loginErrorResponse, loggingService.logInfo, [
      actions.loginRequestBegin(),
      actions.loginRequestFailure(loginErrorResponse.response.data),
    ]);
  });

  it('should handle 500 error code', async () => {
    const loginErrorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: INTERNAL_SERVER_ERROR,
        },
      },
    };

    await testErrorResponse(loginErrorResponse, loggingService.logError, [
      actions.loginRequestBegin(),
      actions.loginRequestFailure(loginErrorResponse.response.data),
    ]);
  });
});
