import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  getThirdPartyAuthContextBegin,
  getThirdPartyAuthContextFailure,
  getThirdPartyAuthContextSuccess,
  THIRD_PARTY_AUTH_CONTEXT,
} from './actions';
import { progressiveProfilingFields, registerFields } from './constants';
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
    // hard code country field, level of education and gender fields
    if (getConfig().ENABLE_HARD_CODE_OPTIONAL_FIELDS) {
      yield put(getThirdPartyAuthContextSuccess(
        registerFields,
        progressiveProfilingFields,
        thirdPartyAuthContext,
      ));
    } else {
      yield put(getThirdPartyAuthContextSuccess(fieldDescriptions, optionalFields, thirdPartyAuthContext));
    }
  } catch (e) {
    yield put(getThirdPartyAuthContextFailure());
    logError(e);
  }
}

export default function* saga() {
  yield takeEvery(THIRD_PARTY_AUTH_CONTEXT.BASE, fetchThirdPartyAuthContext);
}
