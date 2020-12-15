import { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

import { DEFAULT_REDIRECT_URL } from '../data/constants';

/**
 * This wrapper component redirects the requester to our default redirect url if they are
 * already authenticated.
 *
 * @param {node} children The child nodes to render if there is an unauthenticated user.
 */
export default function LoggedInRedirect({ children }) {
  const { authenticatedUser, config } = useContext(AppContext);

  if (authenticatedUser) {
    global.location.href = config.LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    return null;
  }

  return children;
}

LoggedInRedirect.propTypes = {
  children: PropTypes.node.isRequired,
};
