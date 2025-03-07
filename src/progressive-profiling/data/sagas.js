import { call, put, takeEvery } from 'redux-saga/effects';

import {
  SAVE_USER_PROFILE,
  saveUserProfileBegin,
  saveUserProfileFailure,
  saveUserProfileSuccess,
} from './actions';
import { patchAccount } from './service';

export function* saveUserProfileInformation(action) {
  try {
    yield put(saveUserProfileBegin());
    yield call(patchAccount, action.payload.username, action.payload.data);

    yield put(saveUserProfileSuccess());
  } catch (e) {
    yield put(saveUserProfileFailure());
  }
}

export default function* saga() {
  yield takeEvery(SAVE_USER_PROFILE.BASE, saveUserProfileInformation);
}
