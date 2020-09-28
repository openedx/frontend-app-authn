import { combineReducers } from 'redux';

import {
  reducer as logistrationReducer,
  storeName as logistrationStoreName,
} from '../logistration';
import { 
  reducer as forgotPasswordReducer,
  storeName as forgotPasswordStoreName, 
} from '../forgot-password';

const createRootReducer = () => combineReducers({
  [logistrationStoreName]: logistrationReducer,
  [forgotPasswordStoreName]: forgotPasswordReducer,
});
export default createRootReducer;
