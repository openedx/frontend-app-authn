import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GET_FIELDS_DATA,
  getFieldDataBegin,
  getFieldDataFailure,
  getFieldDataSuccess,
  SAVE_USER_PROFILE,
  saveUserProfileBegin,
  saveUserProfileFailure,
  saveUserProfileSuccess,
} from './actions';

import { patchAccount, getOptionalFieldData } from './service';

export function* saveUserProfileInformation(action) {
  try {
    yield put(saveUserProfileBegin());
    yield call(patchAccount, action.payload.username, action.payload.data);

    yield put(saveUserProfileSuccess());
  } catch (e) {
    yield put(saveUserProfileFailure());
  }
}

export function* getFieldData() {
  try {
    yield put(getFieldDataBegin());
    const data = yield call(getOptionalFieldData);
    yield put(getFieldDataSuccess(data.fields, data.extended_profile));
  } catch (e) {
    yield put(getFieldDataFailure());
  }
}

export default function* saga() {
  yield takeEvery(SAVE_USER_PROFILE.BASE, saveUserProfileInformation);
  yield takeEvery(GET_FIELDS_DATA.BASE, getFieldData);
}
