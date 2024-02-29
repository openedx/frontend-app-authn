import { PENDING_STATE } from '../../../data/constants';
import { THIRD_PARTY_AUTH_CONTEXT, THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG } from '../actions';
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
        errorMessage: null,
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

  it('should clear tpa context error message', () => {
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
        errorMessage: 'An error occurred',
      },
    };

    const action = {
      type: THIRD_PARTY_AUTH_CONTEXT_CLEAR_ERROR_MSG,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        ...state,
        thirdPartyAuthApiStatus: PENDING_STATE,
        thirdPartyAuthContext: {
          ...state.thirdPartyAuthContext,
          errorMessage: null,
        },
      },
    );
  });
});
