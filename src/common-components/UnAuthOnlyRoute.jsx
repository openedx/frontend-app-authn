import { useEffect, useState } from 'react';

import { fetchAuthenticatedUser, getAuthenticatedUser } from '@openedx/frontend-base';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { getDashboardRoute } from '../data/utils';

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
      const dashboard = getDashboardRoute();
      if (dashboard.isInternal) {
        return <Navigate to={dashboard.url} replace />;
      }
      window.location.href = dashboard.url;
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
