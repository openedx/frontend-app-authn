import { call, put, takeEvery } from 'redux-saga/effects';
import { logError } from '@edx/frontend-platform/logging';

// Actions
import {
  VALIDATE_TOKEN,
  validateTokenBegin,
  validateTokenSuccess,
  validateTokenFailure,
  RESET_PASSWORD,
  resetPasswordBegin,
  resetPasswordSuccess,
  resetPasswordFailure,
} from './actions';

import { validateToken, resetPassword } from './service';

// Services
export function* handleValidateToken(action) {
  try {
    yield put(validateTokenBegin());
    const data = yield call(validateToken, action.payload.token);
    const isValid = data.is_valid;
    if (isValid) {
      yield put(validateTokenSuccess(isValid, action.payload.token));
    } else {
      yield put(validateTokenFailure(isValid));
    }
  } catch (err) {
    yield put(validateTokenFailure(err));
    logError(err);
  }
}

export function* handleResetPassword(action) {
  try {
    yield put(resetPasswordBegin());
    const data = yield call(resetPassword, action.payload.formPayload, action.payload.token, action.payload.params);
    const resetStatus = data.reset_status;
    const resetErrors = data.err_msg;

    if (resetStatus) {
      yield put(resetPasswordSuccess(resetStatus));
    } else {
      yield put(resetPasswordFailure(resetErrors));
    }
  } catch (err) {
    yield put(resetPasswordFailure(err));
    logError(err);
  }
}

export default function* saga() {
  yield takeEvery(RESET_PASSWORD.BASE, handleResetPassword);
  yield takeEvery(VALIDATE_TOKEN.BASE, handleValidateToken);
}
