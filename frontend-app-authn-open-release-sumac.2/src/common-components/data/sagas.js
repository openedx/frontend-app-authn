import { logError } from '@edx/frontend-platform/logging';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextFailure,
  getThirdPartyAuthContextSuccess,
  THIRD_PARTY_AUTH_CONTEXT,
} from './actions';
import {
  getThirdPartyAuthContext,
} from './service';
import { setCountryFromThirdPartyAuthContext } from '../../register/data/actions';

export function* fetchThirdPartyAuthContext(action) {
  try {
    yield put(getThirdPartyAuthContextBegin());
    const {
      fieldDescriptions, optionalFields, thirdPartyAuthContext,
    } = yield call(getThirdPartyAuthContext, action.payload.urlParams);

    yield put(setCountryFromThirdPartyAuthContext(thirdPartyAuthContext.countryCode));
    yield put(getThirdPartyAuthContextSuccess(fieldDescriptions, optionalFields, thirdPartyAuthContext));
  } catch (e) {
    yield put(getThirdPartyAuthContextFailure());
    logError(e);
  }
}

export default function* saga() {
  yield takeEvery(THIRD_PARTY_AUTH_CONTEXT.BASE, fetchThirdPartyAuthContext);
}
