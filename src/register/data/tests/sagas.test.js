import { camelCaseObject } from '@edx/frontend-platform';
import { runSaga } from 'redux-saga';

import initializeMockLogging from '../../../setupTest';
import * as actions from '../actions';
import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR } from '../constants';
import {
  fetchRealtimeValidations,
  handleNewUserRegistration,
} from '../sagas';
import * as api from '../service';

const { loggingService } = initializeMockLogging();

describe('fetchRealtimeValidations', () => {
  const params = {
    payload: {
      registrationFormData: {
        email: 'test@test.com',
        username: '',
        password: 'test-password',
        name: 'test-name',
        honor_code: true,
        country: 'test-country',
      },
    },
  };

  beforeEach(() => {
    loggingService.logInfo.mockReset();
  });

  const data = {
    validationDecisions: {
      username: 'Username must be between 2 and 30 characters long.',
    },
  };

  it('should call service and dispatch success action', async () => {
    const getFieldsValidations = jest.spyOn(api, 'getFieldsValidations')
      .mockImplementation(() => Promise.resolve({ fieldValidations: data }));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRealtimeValidations,
      params,
    );

    expect(getFieldsValidations).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([
      actions.fetchRealtimeValidationsBegin(),
      actions.fetchRealtimeValidationsSuccess(data),
    ]);
    getFieldsValidations.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const validationRatelimitResponse = {
      response: {
        status: 403,
        data: {
          detail: 'You do not have permission to perform this action.',
        },
      },
    };
    const getFieldsValidations = jest.spyOn(api, 'getFieldsValidations')
      .mockImplementation(() => Promise.reject(validationRatelimitResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRealtimeValidations,
      params,
    );

    expect(getFieldsValidations).toHaveBeenCalledTimes(1);
    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.fetchRealtimeValidationsBegin(),
      actions.fetchRealtimeValidationsFailure(
        validationRatelimitResponse.response.data,
        validationRatelimitResponse.response.status,
      ),
    ]);
    getFieldsValidations.mockClear();
  });

  it('should call logError on 500 server error', async () => {
    const validationRatelimitResponse = {
      response: {
        status: 500,
        data: {},
      },
    };
    const getFieldsValidations = jest.spyOn(api, 'getFieldsValidations')
      .mockImplementation(() => Promise.reject(validationRatelimitResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRealtimeValidations,
      params,
    );

    expect(getFieldsValidations).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    getFieldsValidations.mockClear();
  });
});

describe('handleNewUserRegistration', () => {
  const params = {
    payload: {
      registrationFormData: {
        email: 'test@test.com',
        username: 'test-username',
        password: 'test-password',
        name: 'test-name',
        honor_code: true,
        country: 'test-country',
      },
    },
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
    loggingService.logInfo.mockReset();
  });

  it('should call service and dispatch success action', async () => {
    const authenticatedUser = { username: 'test', user_id: 123 };
    const data = {
      redirectUrl: '/dashboard',
      success: true,
      authenticatedUser,
    };
    const registerRequest = jest.spyOn(api, 'registerRequest')
      .mockImplementation(() => Promise.resolve(data));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleNewUserRegistration,
      params,
    );

    expect(registerRequest).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([
      actions.registerNewUserBegin(),
      actions.registerNewUserSuccess(camelCaseObject(authenticatedUser), data.redirectUrl, data.success),
    ]);
    registerRequest.mockClear();
  });

  it('should handle 500 error code', async () => {
    const registerErrorResponse = {
      response: {
        status: 500,
        data: {
          errorCode: INTERNAL_SERVER_ERROR,
        },
      },
    };

    const registerRequest = jest.spyOn(api, 'registerRequest').mockImplementation(() => Promise.reject(registerErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleNewUserRegistration,
      params,
    );

    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.registerNewUserBegin(),
      actions.registerNewUserFailure(camelCaseObject(registerErrorResponse.response.data)),
    ]);
    registerRequest.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const registerErrorResponse = {
      response: {
        status: 400,
        data: {
          error: 'something went wrong',
        },
      },
    };
    const registerRequest = jest.spyOn(api, 'registerRequest')
      .mockImplementation(() => Promise.reject(registerErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleNewUserRegistration,
      params,
    );

    expect(registerRequest).toHaveBeenCalledTimes(1);
    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.registerNewUserBegin(),
      actions.registerNewUserFailure(registerErrorResponse.response.data),
    ]);
    registerRequest.mockClear();
  });

  it('should handle rate limit error code', async () => {
    const registerErrorResponse = {
      response: {
        status: 403,
        data: {
          errorCode: FORBIDDEN_REQUEST,
        },
      },
    };

    const registerRequest = jest.spyOn(api, 'registerRequest')
      .mockImplementation(() => Promise.reject(registerErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleNewUserRegistration,
      params,
    );

    expect(registerRequest).toHaveBeenCalledTimes(1);
    expect(loggingService.logInfo).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.registerNewUserBegin(),
      actions.registerNewUserFailure(registerErrorResponse.response.data),
    ]);
    registerRequest.mockClear();
  });
});
