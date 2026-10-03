import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import PropTypes from 'prop-types';

import {
  DEFAULT_REDIRECT_URL,
} from '../data/constants';

/**
 * This wrapper redirects the requester to our default redirect url if they are
 * already authenticated.
 */
const UnAuthOnlyRoute = ({ children }) => {
  // MainApp mounts after APP_READY, when initialize() has resolved authentication.
  const authUser = getAuthenticatedUser();
  if (authUser && authUser.username) {
    global.location.href = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    return null;
  }
  return children;
};

UnAuthOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UnAuthOnlyRoute;
