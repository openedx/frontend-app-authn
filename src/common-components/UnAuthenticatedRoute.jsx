/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendPageEvent } from '@edx/frontend-platform/analytics';

import { DEFAULT_REDIRECT_URL } from '../data/constants';

/**
 * This wrapper redirects the requester to our default redirect url if they are
 * already authenticated.
 */
const UnAuthenticatedRoute = (props) => {
  const { authenticatedUser, config } = React.useContext(AppContext);
  const match = useRouteMatch({
    path: props.path,
    exact: props.exact,
    strict: props.strict,
    sensitive: props.sensitive,
  });

  if (authenticatedUser) {
    global.location.href = config.LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    return null;
  }

  useEffect(() => {
    if (match) {
      sendPageEvent('login_and_registration', props.path.replace('/', ''));
    }
  }, [match]);

  return <Route {...props} />;
};

export default UnAuthenticatedRoute;
