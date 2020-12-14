import { runSaga } from 'redux-saga';

import {
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
  fetchRegistrationFormBegin,
  fetchRegistrationFormSuccess,
  fetchRegistrationFormFailure,
} from '../actions';
import { fetchThirdPartyAuthContext, fetchRegistrationForm } from '../sagas';
import * as api from '../service';

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
      .mockImplementation(() => Promise.reject());

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchThirdPartyAuthContext,
      params,
    );

    expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1);
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
      .mockImplementation(() => Promise.reject());

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchRegistrationForm,
    );

    expect(getRegistrationForm).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([fetchRegistrationFormBegin(), fetchRegistrationFormFailure()]);
    getRegistrationForm.mockClear();
  });
});
