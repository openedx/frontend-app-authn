import { combineReducers } from 'redux';

import {
  reducer as logistrationReducer,
  storeName as logistrationStoreName,
} from '../logistration';
import {
  reducer as forgotPasswordReducer,
  storeName as forgotPasswordStoreName,
} from '../forgot-password';
import {
  reducer as resetPasswordReducer,
  storeName as resetPasswordStoreName,
} from '../reset-password';

const createRootReducer = () => combineReducers({
  [logistrationStoreName]: logistrationReducer,
  [forgotPasswordStoreName]: forgotPasswordReducer,
  [resetPasswordStoreName]: resetPasswordReducer,
});
export default createRootReducer;
