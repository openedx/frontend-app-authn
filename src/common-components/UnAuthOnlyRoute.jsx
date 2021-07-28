import React from 'react';
import { Route } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { DEFAULT_REDIRECT_URL } from '../data/constants';

/**
 * This wrapper redirects the requester to our default redirect url if they are
 * already authenticated.
 */
const UnAuthOnlyRoute = (props) => {
  const { authenticatedUser, config } = React.useContext(AppContext);

  if (authenticatedUser) {
    global.location.href = config.LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    return null;
  }

  return <Route {...props} />;
};

export default UnAuthOnlyRoute;
