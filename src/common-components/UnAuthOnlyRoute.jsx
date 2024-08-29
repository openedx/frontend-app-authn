import { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import PropTypes from 'prop-types';

import { RESET_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';

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
      const updatedPath = updatePathWithQueryParams(window.location.pathname);
      if (updatedPath.startsWith(RESET_PAGE)) {
        global.location.href = getConfig().LMS_BASE_URL;
        return null;
      }
      global.location.href = getConfig().LMS_BASE_URL.concat(updatedPath);
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
