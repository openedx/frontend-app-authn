import { call, put, takeEvery } from 'redux-saga/effects';

import { logError, logInfo } from '@edx/frontend-platform/logging';

// Actions
import {
  REGISTER_NEW_USER,
  registerNewUserBegin,
  registerNewUserFailure,
  registerNewUserSuccess,
  REGISTER_FORM_VALIDATIONS,
  fetchRealtimeValidationsBegin,
  fetchRealtimeValidationsSuccess,
  fetchRealtimeValidationsFailure,
} from './actions';

// Services
import { getFieldsValidations, registerRequest } from './service';
import { INTERNAL_SERVER_ERROR } from '../../login/data/constants';

export function* handleNewUserRegistration(action) {
  try {
    yield put(registerNewUserBegin());

    const { redirectUrl, success } = yield call(registerRequest, action.payload.registrationInfo);

    yield put(registerNewUserSuccess(
      redirectUrl,
      success,
    ));
  } catch (e) {
    const statusCodes = [400, 409, 403];
    if (e.response && statusCodes.includes(e.response.status)) {
      yield put(registerNewUserFailure(e.response.data));
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
    const { fieldValidations } = yield call(getFieldsValidations, action.payload.formPayload);

    yield put(fetchRealtimeValidationsSuccess(
      fieldValidations,
    ));
  } catch (e) {
    const statusCodes = [403];
    if (e.response && statusCodes.includes(e.response.status)) {
      yield put(fetchRealtimeValidationsFailure(e.response.data, e.response.status));
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
