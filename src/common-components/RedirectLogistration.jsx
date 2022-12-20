import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { WELCOME_PAGE } from '../data/constants';
import { setCookie } from '../data/utils';

function RedirectLogistration(props) {
  const {
    finishAuthUrl, redirectUrl, redirectToWelcomePage, success, optionalFields,
  } = props;
  let finalRedirectUrl = '';

  if (success) {
    // If we're in a third party auth pipeline, we must complete the pipeline
    // once user has successfully logged in. Otherwise, redirect to the specified redirect url.
    // Note: For multiple enterprise use case, we need to make sure that user first visits the
    // enterprise selection page and then complete the auth workflow
    if (finishAuthUrl && !redirectUrl.includes(finishAuthUrl)) {
      finalRedirectUrl = getConfig().LMS_BASE_URL + finishAuthUrl;
    } else {
      finalRedirectUrl = redirectUrl;
    }

    if (redirectToWelcomePage) {
      setCookie('van-504-returning-user', true);
      // use this component to redirect WelcomePage after successful registration
      // return <Redirect to={WELCOME_PAGE} />;
      const registrationResult = { redirectUrl: finalRedirectUrl, success };
      return (
        <Redirect to={{
          pathname: WELCOME_PAGE,
          state: {
            registrationResult,
            optionalFields,
          },
        }}
        />
      );
    }

    window.location.href = finalRedirectUrl;
  }
  return <></>;
}

RedirectLogistration.defaultProps = {
  finishAuthUrl: null,
  success: false,
  redirectUrl: '',
  redirectToWelcomePage: false,
  optionalFields: {},
};

RedirectLogistration.propTypes = {
  finishAuthUrl: PropTypes.string,
  success: PropTypes.bool,
  redirectUrl: PropTypes.string,
  redirectToWelcomePage: PropTypes.bool,
  optionalFields: PropTypes.shape({}),
};

export default RedirectLogistration;
