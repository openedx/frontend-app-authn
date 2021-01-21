import { call, put, takeEvery } from 'redux-saga/effects';

// Actions
import {
  FORGOT_PASSWORD,
  forgotPasswordBegin,
  forgotPasswordSuccess,
  forgotPasswordForbidden,
} from './actions';

import { forgotPassword } from './service';
import INTERNAL_SERVER_ERROR from './constants';

// Services
export function* handleForgotPassword(action) {
  try {
    yield put(forgotPasswordBegin());

    yield call(forgotPassword, action.payload.email);

    yield put(forgotPasswordSuccess(action.payload.email));
  } catch (e) {
    if (e.response && e.response.status === 403) {
      yield put(forgotPasswordForbidden(null));
    } else {
      yield put(forgotPasswordForbidden(INTERNAL_SERVER_ERROR));
    }
  }
}

export default function* saga() {
  yield takeEvery(FORGOT_PASSWORD.BASE, handleForgotPassword);
}
