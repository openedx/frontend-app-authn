import { call, put, takeEvery } from 'redux-saga/effects';

import { camelCaseObject } from '@edx/frontend-platform';

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
  THIRD_PARTY_AUTH_CONTEXT,
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
} from './actions';

// Services
import { getThirdPartyAuthContext, postNewUser, login } from './service';

export function* handleNewUserRegistration(action) {
  try {
    yield put(registerNewUserBegin());

    const { redirectUrl, success } = yield call(postNewUser, action.payload.registrationInfo);

    yield put(registerNewUserSuccess(
      redirectUrl,
      success,
    ));
  } catch (e) {
    const statusCodes = [400, 409, 403];
    if (e.response && statusCodes.includes(e.response.status)) {
      yield put(registerNewUserFailure(e.response.data));
    }
  }
}

export function* handleLoginRequest(action) {
  try {
    yield put(loginRequestBegin());

    const { redirectUrl, success } = yield call(login, action.payload.creds);

    yield put(loginRequestSuccess(
      redirectUrl,
      success,
    ));
  } catch (e) {
    const statusCodes = [400];
    if (e.response && statusCodes.includes(e.response.status)) {
      yield put(loginRequestFailure(camelCaseObject(e.response.data)));
    }
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
    throw e;
  }
}

export default function* saga() {
  yield takeEvery(REGISTER_NEW_USER.BASE, handleNewUserRegistration);
  yield takeEvery(LOGIN_REQUEST.BASE, handleLoginRequest);
  yield takeEvery(THIRD_PARTY_AUTH_CONTEXT.BASE, fetchThirdPartyAuthContext);
}
