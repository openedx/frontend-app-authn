import { THIRD_PARTY_AUTH_CONTEXT } from '../actions';
import reducer from '../reducers';

describe('common components reducer', () => {
  it('should convert extended profile from string to array', () => {
    const state = {
      extendedProfile: [],
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
      extended_profile: "['state', 'profession']",
    };
    const optionalFields = {
      fields: [],
      extended_profile: "['state', 'profession']",
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
        extendedProfile: ['state', 'profession'],
        fieldDescriptions: [],
        optionalFields: {
          fields: [],
          extended_profile: ['state', 'profession'],
        },
        thirdPartyAuthApiStatus: 'complete',
      },
    );
  });
});
