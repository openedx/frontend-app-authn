import { camelCaseObject } from '@edx/frontend-platform';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import {
  call, put, race, take, takeEvery,
} from 'redux-saga/effects';

import {
  fetchRealtimeValidationsBegin,
  fetchRealtimeValidationsFailure,
  fetchRealtimeValidationsSuccess,
  REGISTER_CLEAR_USERNAME_SUGGESTIONS,
  REGISTER_FORM_VALIDATIONS,
  REGISTER_NEW_USER,
  registerNewUserBegin,
  registerNewUserFailure,
  registerNewUserSuccess,
} from './actions';
import { INTERNAL_SERVER_ERROR } from './constants';
import { getFieldsValidations, registerRequest } from './service';

export function* handleNewUserRegistration(action) {
  try {
    yield put(registerNewUserBegin());

    const { authenticatedUser, redirectUrl, success } = yield call(registerRequest, action.payload.registrationInfo);

    yield put(registerNewUserSuccess(
      camelCaseObject(authenticatedUser),
      redirectUrl,
      success,
    ));
  } catch (e) {
    const statusCodes = [400, 403, 409];
    if (e.response && statusCodes.includes(e.response.status)) {
      yield put(registerNewUserFailure(camelCaseObject(e.response.data)));
      logInfo(e);
    } else {
      yield put(registerNewUserFailure({ errorCode: INTERNAL_SERVER_ERROR }));
      logError(e);
    }
  }
}

export function* fetchRealtimeValidations(action) {
  try {
    yield put(fetchRealtimeValidationsBegin());

    const { response } = yield race({
      response: call(getFieldsValidations, action.payload.formPayload),
      cancel: take(REGISTER_CLEAR_USERNAME_SUGGESTIONS),
    });

    if (response) {
      yield put(fetchRealtimeValidationsSuccess(camelCaseObject(response.fieldValidations)));
    }
  } catch (e) {
    if (e.response && e.response.status === 403) {
      yield put(fetchRealtimeValidationsFailure());
      logInfo(e);
    } else {
      logError(e);
    }
  }
}
export default function* saga() {
  yield takeEvery(REGISTER_NEW_USER.BASE, handleNewUserRegistration);
  yield takeEvery(REGISTER_FORM_VALIDATIONS.BASE, fetchRealtimeValidations);
}
