import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  breakpoints,
  Container,
  Hyperlink,
  Image, Skeleton,
  StatefulButton,
  useMediaQuery,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import { EDUCATION_LEVEL_MAPPING, PERSONALIZED } from './data/constants';
import useAlgoliaRecommendations from './data/hooks/useAlgoliaRecommendations';
import messages from './messages';
import RecommendationsLargeLayout from './RecommendationsPageLayouts/LargeLayout';
import RecommendationsSmallLayout from './RecommendationsPageLayouts/SmallLayout';
import { LINK_TIMEOUT, trackRecommendationsViewed, trackSkipButtonClicked } from './track';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const RecommendationsPage = () => {
  const { formatMessage } = useIntl();
  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth - 1 });
  const location = useLocation();

  const registrationResponse = location.state?.registrationResult;
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const educationLevel = EDUCATION_LEVEL_MAPPING[location.state?.educationLevel];
  const userId = location.state?.userId;

  const userCountry = useSelector((state) => state.register.backendCountryCode);
  const {
    recommendations: algoliaRecommendations,
    isLoading,
  } = useAlgoliaRecommendations(userCountry, educationLevel);

  useEffect(() => {
    if (!isLoading && algoliaRecommendations.length > 0) {
      trackRecommendationsViewed(algoliaRecommendations, PERSONALIZED, userId);
    }
  }, [isLoading, algoliaRecommendations, userId]);

  const handleSkipRecommendationPage = () => {
    window.history.replaceState(location.state, null, '');
    if (registrationResponse) {
      window.location.href = registrationResponse.redirectUrl;
    } else {
      window.location.href = DASHBOARD_URL;
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    trackSkipButtonClicked(userId);
    setTimeout(() => { handleSkipRecommendationPage(); }, LINK_TIMEOUT);
  };

  if (!registrationResponse) {
    window.location.href = DASHBOARD_URL;
    return null;
  }

  if (!isLoading && !algoliaRecommendations.length) {
    handleSkipRecommendationPage();
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['recommendation.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex flex-column bg-light-200 min-vh-100">
        <div className="mb-2">
          <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
          <Container
            id="course-recommendations"
            size="lg"
            className="pr-4 pl-4 mt-4.5 mb-4.5 mb-md-5"
          >
            {isExtraSmall ? (
              <RecommendationsSmallLayout
                userId={userId}
                isLoading={isLoading}
                personalizedRecommendations={algoliaRecommendations}
              />
            ) : (
              <RecommendationsLargeLayout
                userId={userId}
                isLoading={isLoading}
                personalizedRecommendations={algoliaRecommendations}
              />
            )}
            <div className="mt-3 mt-sm-4.5 text-center">
              {isLoading && (
                <Skeleton height={40} width={140} />
              )}
              {!isLoading && algoliaRecommendations.length && (
                <StatefulButton
                  className="font-weight-500"
                  type="submit"
                  variant="outline-brand"
                  labels={{
                    default: formatMessage(messages['recommendation.skip.button']),
                  }}
                  onClick={handleSkip}
                />
              )}
            </div>
          </Container>
        </div>
      </div>
    </>
  );
};

RecommendationsPage.propTypes = {};

export default RecommendationsPage;
