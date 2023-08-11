import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  breakpoints,
  Container,
  Hyperlink,
  Image, Skeleton,
  StatefulButton,
  useMediaQuery,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { EDUCATION_LEVEL_MAPPING, POPULAR } from './data/constants';
import useRecommendations from './data/hooks/useRecommendations';
import messages from './messages';
import RecommendationsLargeLayout from './RecommendationsPageLayouts/LargeLayout';
import RecommendationsSmallLayout from './RecommendationsPageLayouts/SmallLayout';
import { trackRecommendationsViewed } from './track';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const RecommendationsPage = ({ location }) => {
  const { formatMessage } = useIntl();
  const registrationResponse = location.state?.registrationResult;
  const educationLevel = EDUCATION_LEVEL_MAPPING[location.state?.educationLevel];
  const userId = location.state?.userId;

  const isExtraSmall = useMediaQuery({ maxWidth: breakpoints.extraSmall.maxWidth - 1 });

  const {
    algoliaRecommendations, popularProducts, trendingProducts, isLoading,
  } = useRecommendations(educationLevel);

  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    trackRecommendationsViewed(popularProducts, POPULAR, false, userId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRedirection = () => {
    window.history.replaceState(location.state, null, '');
    if (registrationResponse) {
      window.location.href = registrationResponse.redirectUrl;
    } else {
      window.location.href = DASHBOARD_URL;
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    handleRedirection();
  };

  if (!registrationResponse) {
    window.location.href = DASHBOARD_URL;
    return null;
  }

  if (!isLoading && (!popularProducts.length || !trendingProducts.length)) {
    handleRedirection();
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['recommendation.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex flex-column bg-light-200">
        <div className="mb-2">
          <div className="col-md-12 small-screen-top-stripe medium-screen-top-stripe extra-large-screen-top-stripe" />
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
        </div>
        <Container
          id="course-recommendations"
          size="lg"
          className="pr-4 pl-4 mt-3 mt-md-4 mb-4.5 mb-sm-5 mb-md-6 mw-lg"
        >
          {isExtraSmall ? (
            <RecommendationsSmallLayout
              userId={userId}
              isLoading={isLoading}
              personalizedRecommendations={algoliaRecommendations}
              trendingProducts={trendingProducts}
              popularProducts={popularProducts}
            />
          ) : (
            <RecommendationsLargeLayout
              userId={userId}
              isLoading={isLoading}
              personalizedRecommendations={algoliaRecommendations}
              trendingProducts={trendingProducts}
              popularProducts={popularProducts}
            />
          )}
          <div className="mt-3 mt-sm-4.5 text-center">
            {isLoading && (
              <Skeleton className="skip-btn__skeleton" />
            )}
            {!isLoading && (
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
