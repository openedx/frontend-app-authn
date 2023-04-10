import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { AUTHN_PROGRESSIVE_PROFILING, RECOMMENDATIONS } from '../data/constants';
import { setCookie } from '../data/utils';

const RedirectLogistration = (props) => {
  const {
    finishAuthUrl,
    redirectUrl,
    redirectToProgressiveProfilingPage,
    success,
    optionalFields,
    redirectToRecommendationsPage,
    educationLevel,
    userId,
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

    // Redirect to Progressive Profiling after successful registration
    if (redirectToProgressiveProfilingPage) {
      // TODO: Do we still need this cookie?
      setCookie('van-504-returning-user', true);
      const registrationResult = { redirectUrl: finalRedirectUrl, success };
      return (
        <Redirect to={{
          pathname: AUTHN_PROGRESSIVE_PROFILING,
          state: {
            registrationResult,
            optionalFields,
          },
        }}
        />
      );
    }

    // Redirect to Recommendation page
    if (redirectToRecommendationsPage) {
      const registrationResult = { redirectUrl: finalRedirectUrl, success };
      return (
        <Redirect to={{
          pathname: RECOMMENDATIONS,
          state: {
            registrationResult,
            educationLevel,
            userId,
          },
        }}
        />
      );
    }

    window.location.href = finalRedirectUrl;
  }

  return null;
};

RedirectLogistration.defaultProps = {
  educationLevel: null,
  finishAuthUrl: null,
  success: false,
  redirectUrl: '',
  redirectToProgressiveProfilingPage: false,
  optionalFields: {},
  redirectToRecommendationsPage: false,
  userId: null,
};

RedirectLogistration.propTypes = {
  educationLevel: PropTypes.string,
  finishAuthUrl: PropTypes.string,
  success: PropTypes.bool,
  redirectUrl: PropTypes.string,
  redirectToProgressiveProfilingPage: PropTypes.bool,
  optionalFields: PropTypes.shape({}),
  redirectToRecommendationsPage: PropTypes.bool,
  userId: PropTypes.number,
};

export default RedirectLogistration;
