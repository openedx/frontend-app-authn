import reducer from '../reducers';
import {
  REGISTER_CLEAR_USERNAME_SUGGESTIONS, REGISTER_FORM_VALIDATIONS, REGISTER_NEW_USER,
} from '../actions';
import { DEFAULT_STATE } from '../../../data/constants';

describe('register reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        registrationError: {},
        registrationResult: {},
        formData: null,
        validations: null,
        statusCode: null,
        usernameSuggestions: [],
        extendedProfile: [],
        fieldDescriptions: {},
        formRenderState: DEFAULT_STATE,
      },
    );
  });

  it('should set username suggestions upon validation failed case', () => {
    const state = { usernameSuggestions: [] };
    const validations = { usernameSuggestions: ['test12'] };
    const action = {
      type: REGISTER_FORM_VALIDATIONS.SUCCESS,
      payload: { validations },
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        validations,
        usernameSuggestions: validations.usernameSuggestions,
      },
    );
  });

  it('should set username suggestions upon registration error case', () => {
    const state = { usernameSuggestions: [] };
    const payload = { usernameSuggestions: ['test12'] };
    const action = {
      type: REGISTER_NEW_USER.FAILURE,
      payload,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        registrationError: payload,
        submitState: DEFAULT_STATE,
        usernameSuggestions: payload.usernameSuggestions,
        validations: null,
      },
    );
  });

  it('should clear username suggestions from validations state', () => {
    const state = {
      usernameSuggestions: ['test_1'],
    };
    const action = {
      type: REGISTER_CLEAR_USERNAME_SUGGESTIONS,
    };

    expect(
      reducer(state, action),
    ).toEqual(
      {
        usernameSuggestions: [],
      },
    );
  });
});
