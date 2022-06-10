import { combineReducers } from 'redux';

import {
  reducer as commonComponentsReducer,
  storeName as commonComponentsStoreName,
} from '../common-components';
import {
  reducer as forgotPasswordReducer,
  storeName as forgotPasswordStoreName,
} from '../forgot-password';
import {
  reducer as loginReducer,
  storeName as loginStoreName,
} from '../login';
import {
  reducer as registerReducer,
  storeName as registerStoreName,
} from '../register';
import {
  reducer as resetPasswordReducer,
  storeName as resetPasswordStoreName,
} from '../reset-password';
import {
  reducer as welcomePageReducers,
  storeName as welcomePageStoreName,
} from '../welcome';

const createRootReducer = () => combineReducers({
  [loginStoreName]: loginReducer,
  [registerStoreName]: registerReducer,
  [commonComponentsStoreName]: commonComponentsReducer,
  [forgotPasswordStoreName]: forgotPasswordReducer,
  [resetPasswordStoreName]: resetPasswordReducer,
  [welcomePageStoreName]: welcomePageReducers,
});
export default createRootReducer;
