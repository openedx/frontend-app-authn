import { runSaga } from 'redux-saga';

import {
  fetchRealtimeValidationsBegin,
  fetchRealtimeValidationsSuccess,
  fetchRealtimeValidationsFailure,
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
  fetchRegistrationFormBegin,
  fetchRegistrationFormSuccess,
  fetchRegistrationFormFailure,
} from '../actions';
import { fetchRealtimeValidations, fetchThirdPartyAuthContext, fetchRegistrationForm } from '../sagas';
import * as api from '../service';
import initializeMockLogging from '../../../setupTest';

const { loggingService } = initializeMockLogging();

describe('fetchThirdPartyAuthContext', () => {
  const params = {
    payload: { urlParams: {} },
  };

  const data = {
    currentProvider: null,
    providers: [],
    secondaryProviders: [],
    finishAuthUrl: null,
    pipelineUserDetails: {},
  };

  beforeEach(() => {
    loggingService.logError.mockReset();
  });

  it('should call service and dispatch success action', async () => {
    const getThirdPartyAuthContext = jest.spyOn(api, 'getThirdPartyAuthContext')
      .mockImplementation(() => Promise.resolve({ thirdPartyAuthContext: data }));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchThirdPartyAuthContext,
      params,
    );

    expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([getThirdPartyAuthContextBegin(), getThirdPartyAuthContextSuccess(data)]);
    getThirdPartyAuthContext.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const getThirdPartyAuthContext = jest.spyOn(api, 'getThirdPartyAuthContext')
      .mockImplementation(() => Promise.reject(new Error('something went wrong')));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchThirdPartyAuthContext,
      params,
    );

    expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([getThirdPartyAuthContextBegin(), getThirdPartyAuthContextFailure()]);
    getThirdPartyAuthContext.mockClear();
  });
});

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
    expect(dispatched).toEqual([fetchRegistrationFormBegin(), fetchRegistrationFormSuccess(data)]);
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
    expect(dispatched).toEqual([fetchRegistrationFormBegin(), fetchRegistrationFormFailure()]);
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
    expect(dispatched).toEqual([fetchRealtimeValidationsBegin(), fetchRealtimeValidationsSuccess(data)]);
    getFieldsValidations.mockClear();
  });

  it('should call service and dispatch error action', async () => {
    const getFieldsValidations = jest.spyOn(api, 'getFieldsValidations')
      .mockImplementation(() => Promise.reject(Error('something went wrong')));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRealtimeValidations,
      params,
    );

    expect(getFieldsValidations).toHaveBeenCalledTimes(1);
    expect(loggingService.logError).toHaveBeenCalled();
    expect(dispatched).toEqual([fetchRealtimeValidationsBegin(), fetchRealtimeValidationsFailure()]);
    getFieldsValidations.mockClear();
  });
});
