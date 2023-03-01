import React, { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Image, Spinner, StatefulButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { DEFAULT_REDIRECT_URL } from '../data/constants';
import { EDUCATION_LEVEL_MAPPING, RECOMMENDATIONS_COUNT } from './data/constants';
import getPersonalizedRecommendations from './data/service';
import { convertCourseRunKeytoCourseKey } from './data/utils';
import messages from './messages';
import RecommendationsList from './RecommendationsList';
import { trackRecommendationsViewed } from './track';

const RecommendationsPage = (props) => {
  const { intl, location } = props;
  const registrationResponse = location.state?.registrationResult;
  const userId = location.state?.userId;
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const educationLevel = EDUCATION_LEVEL_MAPPING[location.state?.educationLevel];

  useEffect(() => {
    if (registrationResponse) {
      const generalRecommendations = JSON.parse(getConfig().GENERAL_RECOMMENDATIONS);
      let coursesWithKeys = [];
      getPersonalizedRecommendations(educationLevel).then((response) => {
        coursesWithKeys = response.map(course => ({
          ...course,
          courseKey: convertCourseRunKeytoCourseKey(course.activeRunKey),
        }));

        if (coursesWithKeys.length >= RECOMMENDATIONS_COUNT) {
          setRecommendations(coursesWithKeys.slice(0, RECOMMENDATIONS_COUNT));
        } else {
          const courseRecommendations = coursesWithKeys.concat(generalRecommendations);
          // Remove duplicate recommendations
          const uniqueRecommendations = courseRecommendations.filter(
            (recommendation, index, self) => index === self.findIndex((existingRecommendation) => (
              existingRecommendation.courseKey === recommendation.courseKey
            )),
          );
          setRecommendations(uniqueRecommendations.slice(0, RECOMMENDATIONS_COUNT));
        }

        setIsLoading(false);
      })
        .catch(() => {
          setRecommendations(generalRecommendations.slice(0, RECOMMENDATIONS_COUNT));
          setIsLoading(false);
        });
      // We only want to track the recommendations returned by Algolia
      const courseKeys = coursesWithKeys.map(course => course.courseKey);
      trackRecommendationsViewed(courseKeys, false, userId);
    }
  }, [registrationResponse, DASHBOARD_URL, educationLevel, userId]);

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

  if (!isLoading && recommendations.length < RECOMMENDATIONS_COUNT) {
    handleRedirection();
  }

  const handleSkip = (e) => {
    e.preventDefault();
    handleRedirection();
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage(messages['recommendation.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex flex-column vh-100">
        <div className="mb-2">
          <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
        </div>
        {(!isLoading && recommendations.length === RECOMMENDATIONS_COUNT) ? (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-1">
            <RecommendationsList
              title={intl.formatMessage(messages['recommendation.page.heading'])}
              recommendations={recommendations}
              userId={userId}
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
    </>
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
