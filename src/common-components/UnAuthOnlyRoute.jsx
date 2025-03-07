import { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import PropTypes from 'prop-types';

import {
  DEFAULT_REDIRECT_URL,
} from '../data/constants';

/**
 * This wrapper redirects the requester to our default redirect url if they are
 * already authenticated.
 */
const UnAuthOnlyRoute = ({ children }) => {
  const [authUser, setAuthUser] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchAuthenticatedUser({ forceRefresh: !!getAuthenticatedUser() }).then((authenticatedUser) => {
      setAuthUser(authenticatedUser);
      setIsReady(true);
    });
  }, []);

  if (isReady) {
    if (authUser && authUser.username) {
      global.location.href = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
      return null;
    }

    return children;
  }

  return null;
};

UnAuthOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UnAuthOnlyRoute;
