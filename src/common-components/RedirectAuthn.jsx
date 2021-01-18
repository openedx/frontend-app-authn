import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';

function RedirectAuthn(props) {
  const { finishAuthUrl, success, redirectUrl } = props;

  if (success) {
    // If we're in a third party auth pipeline, we must complete the pipeline
    // once user has successfully logged in. Otherwise, redirect to the specified redirect url.
    if (finishAuthUrl) {
      window.location.href = getConfig().LMS_BASE_URL + finishAuthUrl;
    } else {
      window.location.href = redirectUrl;
    }
  }
  return <></>;
}

RedirectAuthn.defaultProps = {
  finishAuthUrl: null,
  success: false,
  redirectUrl: '',
};

RedirectAuthn.propTypes = {
  finishAuthUrl: PropTypes.string,
  success: PropTypes.bool,
  redirectUrl: PropTypes.string,
};

export default RedirectAuthn;
