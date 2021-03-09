import { call, put, takeEvery } from 'redux-saga/effects';
import { logError, logInfo } from '@edx/frontend-platform/logging';

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
import { INTERNAL_SERVER_ERROR, API_RATELIMIT_ERROR } from '../../data/constants';

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
    const statusCodes = [429];
    if (err.response && statusCodes.includes(err.response.status)) {
      yield put(validateTokenFailure(API_RATELIMIT_ERROR));
      logInfo(err);
    } else {
      yield put(validateTokenFailure(INTERNAL_SERVER_ERROR));
      logError(err);
    }
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
    const statusCodes = [429];
    if (err.response && statusCodes.includes(err.response.status)) {
      yield put(resetPasswordFailure(API_RATELIMIT_ERROR));
      logInfo(err);
    } else {
      yield put(resetPasswordFailure(INTERNAL_SERVER_ERROR));
      logError(err);
    }
  }
}

export default function* saga() {
  yield takeEvery(RESET_PASSWORD.BASE, handleResetPassword);
  yield takeEvery(VALIDATE_TOKEN.BASE, handleValidateToken);
}
