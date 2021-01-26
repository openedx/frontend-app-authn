import { runSaga } from 'redux-saga';

import * as actions from '../actions';
import {
  fetchRealtimeValidations,
  fetchRegistrationForm,
  handleNewUserRegistration,
} from '../sagas';
import * as api from '../service';
import initializeMockLogging from '../../../setupTest';

const { loggingService } = initializeMockLogging();

describe('fetchRegistrationForm', () => {
  const data = {
    fields: [{
      label: 'City',
      name: 'city',
      type: 'text',
      errorMessages: {
        required: 'invalid city',
      },
      required: true,
    },
    {
      label: 'I agree to the Your Platform Name Here <a href="/honor" rel="noopener" target="_blank">Honor Code</a>',
      name: 'honor_code',
      type: 'checkbox',
      errorMessages: {
        required: 'invalid honor code',
      },
      required: true,
    }],
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
  });

  it('should call service and dispatch success action', async () => {
    const getRegistrationForm = jest.spyOn(api, 'getRegistrationForm')
      .mockImplementation(() => Promise.resolve({ registrationForm: data }));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRegistrationForm,
    );

    expect(getRegistrationForm).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([
      actions.fetchRegistrationFormBegin(),
      actions.fetchRegistrationFormSuccess(data),
    ]);
    getRegistrationForm.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const getRegistrationForm = jest.spyOn(api, 'getRegistrationForm')
      .mockImplementation(() => Promise.reject(new Error('something went wrong')));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRegistrationForm,
    );

    expect(getRegistrationForm).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.fetchRegistrationFormBegin(),
      actions.fetchRegistrationFormFailure(),
    ]);
    getRegistrationForm.mockClear();
  });
});

describe('fetchRealtimeValidations', () => {
  const params = {
    payload: {
      formData: {
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
    loggingService.logError.mockReset();
  });

  const data = {
    validation_decisions: {
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
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.fetchRealtimeValidationsBegin(),
      actions.fetchRealtimeValidationsFailure(
        validationRatelimitResponse.response.data,
        validationRatelimitResponse.response.status,
      ),
    ]);
    getFieldsValidations.mockClear();
  });
});

describe('handleNewUserRegistration', () => {
  const params = {
    payload: {
      formData: {
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
  });

  it('should call service and dispatch success action', async () => {
    const data = { redirectUrl: '/dashboard', success: true };
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
      actions.registerNewUserSuccess(data.redirectUrl, data.success),
    ]);
    registerRequest.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const loginErrorResponse = {
      response: {
        status: 400,
        data: {
          error: 'something went wrong',
        },
      },
    };
    const registerRequest = jest.spyOn(api, 'registerRequest')
      .mockImplementation(() => Promise.reject(loginErrorResponse));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      handleNewUserRegistration,
      params,
    );

    expect(registerRequest).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([
      actions.registerNewUserBegin(),
      actions.registerNewUserFailure(loginErrorResponse.response.data),
    ]);
    registerRequest.mockClear();
  });
});
