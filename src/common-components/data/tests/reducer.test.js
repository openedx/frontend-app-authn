import { THIRD_PARTY_AUTH_CONTEXT } from '../actions';
import reducer from '../reducers';

describe('common components reducer', () => {
  it('test mfe context response', () => {
    const state = {
      fieldDescriptions: {},
      optionalFields: {},
      thirdPartyAuthApiStatus: null,
      thirdPartyAuthContext: {
        currentProvider: null,
        finishAuthUrl: null,
        countryCode: null,
        providers: [],
        secondaryProviders: [],
        pipelineUserDetails: null,
      },
    };
    const fieldDescriptions = {
      fields: [],
    };
    const optionalFields = {
      fields: [],
      extended_profile: {},
    };
    const thirdPartyAuthContext = { ...state.thirdPartyAuthContext };
    const action = {
      type: THIRD_PARTY_AUTH_CONTEXT.SUCCESS,
      payload: { fieldDescriptions, optionalFields, thirdPartyAuthContext },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        ...state,
        fieldDescriptions: [],
        optionalFields: {
          fields: [],
          extended_profile: {},
        },
        thirdPartyAuthApiStatus: 'complete',
      },
    );
  });
});
