import React from 'react';

import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

import { PAGE_NOT_FOUND } from '../data/constants';
import { isHostAvailableInQueryParams } from '../data/utils';

/**
 * This wrapper redirects the requester to embedded register page only if host
 * query param is present.
 */
const EmbeddedRegistrationRoute = (props) => {
  const registrationEmbedded = isHostAvailableInQueryParams();

  // Show registration page for embedded experience even if the user is authenticated
  if (registrationEmbedded) {
    return <Route {...props} />;
  }

  return <Redirect to={PAGE_NOT_FOUND} />;
};

EmbeddedRegistrationRoute.propTypes = {
  path: PropTypes.string.isRequired,
};

export default EmbeddedRegistrationRoute;
