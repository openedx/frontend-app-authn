import { all } from 'redux-saga/effects';

import { saga as registrationSaga } from '../logistration';
import { saga as forgotPasswordSaga } from '../forgot-password';

export default function* rootSaga() {
  yield all([
    registrationSaga(),
    forgotPasswordSaga(),
  ]);
}
