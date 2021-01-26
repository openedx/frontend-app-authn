import { call, put, takeEvery } from 'redux-saga/effects';

import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { INTERNAL_SERVER_ERROR } from './constants';

// Actions
import {
  LOGIN_REQUEST,
  loginRequestBegin,
  loginRequestFailure,
  loginRequestSuccess,
} from './actions';

// Services
import {
  loginRequest,
} from './service';

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

export default function* saga() {
  yield takeEvery(LOGIN_REQUEST.BASE, handleLoginRequest);
}
