import React, { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

import {
  DEFAULT_REDIRECT_URL, REGISTER_PAGE,
} from '../data/constants';
import { isRegistrationEmbedded } from '../data/utils/dataUtils';

/**
 * This wrapper redirects the requester to our default redirect url if they are
 * already authenticated.
 */
const UnAuthOnlyRoute = (props) => {
  const [authUser, setAuthUser] = useState({});
  const [isReady, setIsReady] = useState(false);
  const registrationEmbedded = isRegistrationEmbedded() && props.path === REGISTER_PAGE;

  useEffect(() => {
    if (registrationEmbedded) { return; }
    fetchAuthenticatedUser({ forceRefresh: !!getAuthenticatedUser() }).then((authenticatedUser) => {
      setAuthUser(authenticatedUser);
      setIsReady(true);
    });
  }, [registrationEmbedded]);

  // Show registration page for embedded experience even if the user is authenticated
  if (registrationEmbedded) {
    return <Route {...props} />;
  }

  if (isReady) {
    if (authUser && authUser.username) {
      global.location.href = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
      return null;
    }

    return <Route {...props} />;
  }

  return null;
};

UnAuthOnlyRoute.propTypes = {
  path: PropTypes.string.isRequired,
};

export default UnAuthOnlyRoute;
