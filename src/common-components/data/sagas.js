import { call, put, takeEvery } from 'redux-saga/effects';

import { logError } from '@edx/frontend-platform/logging';

// Actions
import {
  THIRD_PARTY_AUTH_CONTEXT,
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextSuccess,
  getThirdPartyAuthContextFailure,
} from './actions';

// Services
import {
  getThirdPartyAuthContext,
} from './service';

export function* fetchThirdPartyAuthContext(action) {
  try {
    yield put(getThirdPartyAuthContextBegin());
    const { fieldDescriptions, thirdPartyAuthContext } = yield call(getThirdPartyAuthContext, action.payload.urlParams);

    yield put(getThirdPartyAuthContextSuccess(
      fieldDescriptions, thirdPartyAuthContext,
    ));
  } catch (e) {
    yield put(getThirdPartyAuthContextFailure());
    logError(e);
  }
}

export default function* saga() {
  yield takeEvery(THIRD_PARTY_AUTH_CONTEXT.BASE, fetchThirdPartyAuthContext);
}
