import React from 'react';

import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { PAGE_NOT_FOUND } from '../data/constants';
import { isHostAvailableInQueryParams } from '../data/utils';

/**
 * This wrapper redirects the requester to embedded register page only if host
 * query param is present.
 */
const EmbeddedRegistrationRoute = ({ children }) => {
  const registrationEmbedded = isHostAvailableInQueryParams();

  // Show registration page for embedded experience even if the user is authenticated
  if (registrationEmbedded) {
    return children;
  }

  return <Navigate to={PAGE_NOT_FOUND} replace />;
};

EmbeddedRegistrationRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EmbeddedRegistrationRoute;
