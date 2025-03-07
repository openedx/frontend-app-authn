import { AsyncActionType } from '../../data/utils';

export const GET_FIELDS_DATA = new AsyncActionType('FIELD_DESCRIPTION', 'GET_FIELDS_DATA');
export const SAVE_USER_PROFILE = new AsyncActionType('USER_PROFILE', 'SAVE_USER_PROFILE');

// save additional user information
export const saveUserProfile = (username, data) => ({
  type: SAVE_USER_PROFILE.BASE,
  payload: { username, data },
});

export const saveUserProfileBegin = () => ({
  type: SAVE_USER_PROFILE.BEGIN,
});

export const saveUserProfileSuccess = () => ({
  type: SAVE_USER_PROFILE.SUCCESS,
});

export const saveUserProfileFailure = () => ({
  type: SAVE_USER_PROFILE.FAILURE,
});
