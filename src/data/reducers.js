import { combineReducers } from 'redux';

import {
  reducer as authnReducer,
  storeName as authnStoreName,
} from '../authn';
import {
  reducer as forgotPasswordReducer,
  storeName as forgotPasswordStoreName,
} from '../forgot-password';
import {
  reducer as resetPasswordReducer,
  storeName as resetPasswordStoreName,
} from '../reset-password';

const createRootReducer = () => combineReducers({
  [authnStoreName]: authnReducer,
  [forgotPasswordStoreName]: forgotPasswordReducer,
  [resetPasswordStoreName]: resetPasswordReducer,
});
export default createRootReducer;
