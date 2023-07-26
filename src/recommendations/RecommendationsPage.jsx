import React, { useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Image, StatefulButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { RECOMMENDATIONS_COUNT, RECOMMENDATIONS_OPTION_LIST } from './data/constants';
import messages from './messages';
import RecommendationsList from './RecommendationsList';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const RecommendationsPage = (props) => {
  const { location } = props;
  const registrationResponse = location.state?.registrationResult;
  const userId = location.state?.userId;
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  const { formatMessage } = useIntl();
  const [selectedRecommendationsType, setSelectedRecommendationsType] = useState(RECOMMENDATIONS_OPTION_LIST[1]);
  const [recommendations] = useState([]);

  const handleRecommendationType = (option) => {
    setSelectedRecommendationsType(option);
  };

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

  if (recommendations.length < RECOMMENDATIONS_COUNT) {
    handleRedirection();
  }

  const handleSkip = (e) => {
    e.preventDefault();
    handleRedirection();
  };

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['recommendation.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex flex-column vh-100 bg-light-200">
        <div className="mb-2">
          <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
        </div>
        {(recommendations) && (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-1">
            <RecommendationsList
              title={formatMessage(messages['recommendation.page.heading'])}
              recommendations={recommendations}
              userId={userId}
              setSelectedRecommendationsType={handleRecommendationType}
              selectedRecommendationsType={selectedRecommendationsType}
            />
            <div className="text-center">
              <StatefulButton
                className="font-weight-500"
                type="submit"
                variant="brand"
                labels={{
                  default: formatMessage(messages['recommendation.skip.button']),
                }}
                onClick={handleSkip}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

RecommendationsPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      registrationResult: PropTypes.shape({
        redirectUrl: PropTypes.string,
      }),
      userId: PropTypes.number,
      educationLevel: PropTypes.string,
    }),
  }),

};

RecommendationsPage.defaultProps = {
  location: { state: {} },
};

export default RecommendationsPage;
