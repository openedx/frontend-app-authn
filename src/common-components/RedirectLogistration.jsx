import { useAppConfig, getSiteConfig } from '@openedx/frontend-base';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import {
  AUTHN_PROGRESSIVE_PROFILING, REDIRECT,
} from '../data/constants';
import { setCookie } from '../data/utils';

const RedirectLogistration = (props) => {
  const {
    authenticatedUser,
    finishAuthUrl,
    redirectUrl,
    redirectToProgressiveProfilingPage,
    success,
    optionalFields,
    educationLevel,
    userId,
    registrationEmbedded,
    host,
  } = props;
  let finalRedirectUrl = '';

  if (success) {
    // If we're in a third party auth pipeline, we must complete the pipeline
    // once user has successfully logged in. Otherwise, redirect to the specified redirect url.
    // Note: For multiple enterprise use case, we need to make sure that user first visits the
    // enterprise selection page and then complete the auth workflow
    if (finishAuthUrl && !redirectUrl.includes(finishAuthUrl)) {
      finalRedirectUrl = getSiteConfig().lmsBaseUrl + finishAuthUrl;
    } else {
      finalRedirectUrl = redirectUrl;
    }

    // Redirect to Progressive Profiling after successful registration
    if (redirectToProgressiveProfilingPage) {
      // TODO: Do we still need this cookie?
      setCookie('van-504-returning-user', true, useAppConfig().SESSION_COOKIE_DOMAIN);

      if (registrationEmbedded) {
        window.parent.postMessage({
          action: REDIRECT,
          redirectUrl: useAppConfig().POST_REGISTRATION_REDIRECT_URL,
        }, host);
        return null;
      }
      const registrationResult = { redirectUrl: finalRedirectUrl, success };
      return (
        <Navigate
          to={AUTHN_PROGRESSIVE_PROFILING}
          state={{
            registrationResult,
            optionalFields,
            authenticatedUser,
          }}
          replace
        />
      );
    }

    window.location.href = finalRedirectUrl;
  }

  return null;
};

RedirectLogistration.defaultProps = {
  authenticatedUser: {},
  educationLevel: null,
  finishAuthUrl: null,
  success: false,
  redirectUrl: '',
  redirectToProgressiveProfilingPage: false,
  optionalFields: {},
  userId: null,
  registrationEmbedded: false,
  host: '',
};

RedirectLogistration.propTypes = {
  authenticatedUser: PropTypes.shape({}),
  educationLevel: PropTypes.string,
  finishAuthUrl: PropTypes.string,
  success: PropTypes.bool,
  redirectUrl: PropTypes.string,
  redirectToProgressiveProfilingPage: PropTypes.bool,
  optionalFields: PropTypes.shape({}),
  userId: PropTypes.number,
  registrationEmbedded: PropTypes.bool,
  host: PropTypes.string,
};

export default RedirectLogistration;
