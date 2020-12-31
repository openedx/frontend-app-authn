import { call, put, takeEvery } from 'redux-saga/effects';

import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { INTERNAL_SERVER_ERROR } from './constants';

// Actions
import {
  REGISTER_NEW_USER,
  registerNewUserBegin,
  registerNewUserFailure,
  registerNewUserSuccess,
  LOGIN_REQUEST,
  loginRequestBegin,
  loginRequestFailure,
  loginRequestSuccess,
  REGISTER_FORM_VALIDATIONS,
  fetchRealtimeValidationsBegin,
  fetchRealtimeValidationsSuccess,
  fetchRealtimeValidationsFailure,
  THIRD_PARTY_AUTH_CONTEXT,
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
  REGISTER_FORM,
  fetchRegistrationFormBegin,
  fetchRegistrationFormSuccess,
  fetchRegistrationFormFailure,
} from './actions';

// Services
import {
  getFieldsValidations,
  getRegistrationForm,
  getThirdPartyAuthContext,
  registerRequest,
  loginRequest,
} from './service';

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
    }
    logError(e);
  }
}

export function* handleLoginRequest(action) {
  try {
    yield put(loginRequestBegin());

    const { redirectUrl, success } = yield call(loginRequest, action.payload.creds);

    yield put(loginRequestSuccess(
      redirectUrl,
      success,
    ));
  } catch (e) {
    const statusCodes = [400];
    if (e.response) {
      if (statusCodes.includes(e.response.status)) {
        yield put(loginRequestFailure(camelCaseObject(e.response.data)));
      } else {
        yield put(loginRequestFailure(camelCaseObject({ errorCode: INTERNAL_SERVER_ERROR })));
      }
    }
    logError(e);
  }
}

export function* fetchThirdPartyAuthContext(action) {
  try {
    yield put(getThirdPartyAuthContextBegin());
    const { thirdPartyAuthContext } = yield call(getThirdPartyAuthContext, action.payload.urlParams);

    yield put(getThirdPartyAuthContextSuccess(
      thirdPartyAuthContext,
    ));
  } catch (e) {
    yield put(getThirdPartyAuthContextFailure());
    logError(e);
  }
}

export function* fetchRegistrationForm() {
  try {
    yield put(fetchRegistrationFormBegin());
    const { registrationForm } = yield call(getRegistrationForm);

    yield put(fetchRegistrationFormSuccess(
      registrationForm,
    ));
  } catch (e) {
    yield put(fetchRegistrationFormFailure());
    logError(e);
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
    yield put(fetchRealtimeValidationsFailure());
    logError(e);
  }
}

export default function* saga() {
  yield takeEvery(REGISTER_NEW_USER.BASE, handleNewUserRegistration);
  yield takeEvery(LOGIN_REQUEST.BASE, handleLoginRequest);
  yield takeEvery(THIRD_PARTY_AUTH_CONTEXT.BASE, fetchThirdPartyAuthContext);
  yield takeEvery(REGISTER_FORM.BASE, fetchRegistrationForm);
  yield takeEvery(REGISTER_FORM_VALIDATIONS.BASE, fetchRealtimeValidations);
}
