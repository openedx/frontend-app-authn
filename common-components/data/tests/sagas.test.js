import { runSaga } from 'redux-saga';

import { setCountryFromThirdPartyAuthContext } from '../../../register/data/actions';
import initializeMockLogging from '../../../setupTest';
import * as actions from '../actions';
import { fetchThirdPartyAuthContext } from '../sagas';
import * as api from '../service';

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
      .mockImplementation(() => Promise.resolve({
        thirdPartyAuthContext: data,
        fieldDescriptions: {},
        optionalFields: {},
      }));

    const dispatched = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      fetchThirdPartyAuthContext,
      params,
    );

    expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1);
    expect(dispatched).toEqual([
      actions.getThirdPartyAuthContextBegin(),
      setCountryFromThirdPartyAuthContext(),
      actions.getThirdPartyAuthContextSuccess({}, {}, data),
    ]);
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
    expect(dispatched).toEqual([
      actions.getThirdPartyAuthContextBegin(),
      actions.getThirdPartyAuthContextFailure(),
    ]);
    getThirdPartyAuthContext.mockClear();
  });
});
