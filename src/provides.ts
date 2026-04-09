import { providesChromelessRolesId } from '@openedx/frontend-base';
import {
  confirmPasswordRole,
  loginRole,
  registerRole,
  resetPasswordRole,
  welcomeRole,
} from './constants';

const provides = {
  [providesChromelessRolesId]: [loginRole, registerRole, resetPasswordRole, confirmPasswordRole, welcomeRole],
};

export default provides;
