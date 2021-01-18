import { all } from 'redux-saga/effects';

import { saga as registrationSaga } from '../authn';
import { saga as forgotPasswordSaga } from '../forgot-password';
import { saga as resetPasswordSaga } from '../reset-password';

export default function* rootSaga() {
  yield all([
    registrationSaga(),
    forgotPasswordSaga(),
    resetPasswordSaga(),
  ]);
}
