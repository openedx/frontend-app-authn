import React, { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Image, Spinner, StatefulButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import { DEFAULT_REDIRECT_URL, EDUCATION_LEVEL_MAPPING } from '../data/constants';
import getPersonalizedRecommendations from './data/service';
import messages from './messages';
import RecommendationsList from './RecommendationsList';

const RecommendationsPage = (props) => {
  const { intl, location } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const educationLevel = EDUCATION_LEVEL_MAPPING[location.state?.educationLevel];
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const registrationResponse = location.state?.registrationResult;

  useEffect(() => {
    getPersonalizedRecommendations(educationLevel).then((response) => {
      if (response.length > 2) {
        setRecommendations(response);
      }
      setIsLoading(false);
    })
      .catch(() => {
        setIsLoading(false);
      });
  }, [DASHBOARD_URL, educationLevel]);

  if (!registrationResponse) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  const handleRedirection = () => {
    window.history.replaceState(location.state, null, '');
    if (registrationResponse) {
      window.location.href = registrationResponse.redirectUrl;
    } else {
      window.location.href = DASHBOARD_URL;
    }
  };

  if (!isLoading && recommendations.length < 3) {
    handleRedirection();
  }

  const handleSkip = (e) => {
    e.preventDefault();
    handleRedirection();
  };

  return (
    <div className="d-flex flex-column vh-100">
      <div className="mb-2">
        <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
        </Hyperlink>
      </div>
      {(!isLoading && recommendations.length > 2) ? (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-1">
          <RecommendationsList
            title={intl.formatMessage(messages['recommendation.page.heading'])}
            recommendations={recommendations}
          />
          <div className="text-center">
            <StatefulButton
              className="font-weight-500"
              type="submit"
              variant="brand"
              labels={{
                default: intl.formatMessage(messages['recommendation.skip.button']),
              }}
              onClick={handleSkip}
            />
          </div>
        </div>
      )
        : (
          <Spinner animation="border" variant="primary" className="centered-align-spinner" />
        )}
    </div>
  );
};

RecommendationsPage.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),

};

RecommendationsPage.defaultProps = {
  location: { state: {} },
};

export default injectIntl(RecommendationsPage);
