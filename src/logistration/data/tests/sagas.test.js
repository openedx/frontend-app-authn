import { runSaga } from 'redux-saga';

import {
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
} from '../actions';
import { fetchThirdPartyAuthContext } from '../sagas';
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
