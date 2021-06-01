import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';

function RedirectLogistration(props) {
  const { finishAuthUrl, redirectUrl, success } = props;

  if (success) {
    // If we're in a third party auth pipeline, we must complete the pipeline
    // once user has successfully logged in. Otherwise, redirect to the specified redirect url.
    // Note: For multiple enterprise use case, we need to make sure that user first visits the
    // enterprise selection page and then complete the auth workflow
    if (finishAuthUrl && !redirectUrl.includes(finishAuthUrl)) {
      window.location.href = getConfig().LMS_BASE_URL + finishAuthUrl;
    } else {
      // use this component to redirect WelcomePage after successful registration
      // return <Redirect to={WELCOME_PAGE} />;
      window.location.href = redirectUrl;
    }
  }
  return <></>;
}

RedirectLogistration.defaultProps = {
  finishAuthUrl: null,
  success: false,
  redirectUrl: '',
};

RedirectLogistration.propTypes = {
  finishAuthUrl: PropTypes.string,
  success: PropTypes.bool,
  redirectUrl: PropTypes.string,
};

export default RedirectLogistration;
