import React, { useEffect } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Skeleton } from '@edx/paragon';
import PropTypes from 'prop-types';

import { PERSONALIZED, POPULAR, TRENDING } from '../data/constants';
import loadingCoursesPlaceholders from '../data/loadingCoursesPlaceholders';
import messages from '../messages';
import RecommendationsList from '../RecommendationsList';
import { trackRecommendationsViewed } from '../track';

const RecommendationsLargeLayout = (props) => {
  const {
    userId,
    isLoading,
    personalizedRecommendations,
    trendingProducts,
    popularProducts,
  } = props;
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (!isLoading) {
      trackRecommendationsViewed(personalizedRecommendations, PERSONALIZED, userId);
      trackRecommendationsViewed(popularProducts, POPULAR, userId);
      trackRecommendationsViewed(trendingProducts, TRENDING, userId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <>
        <Skeleton className="recommendations-heading__skeleton" />
        <Skeleton className="recommendations-subheading__skeleton" />
        <RecommendationsList
          recommendations={loadingCoursesPlaceholders}
          userId={userId}
          isLoading
        />
        <Skeleton className="recommendations-subheading__skeleton" />
        <RecommendationsList
          recommendations={loadingCoursesPlaceholders}
          userId={userId}
          isLoading
        />
        <Skeleton className="recommendations-subheading__skeleton" />
        <RecommendationsList
          recommendations={loadingCoursesPlaceholders}
          userId={userId}
          isLoading
        />
      </>
    );
  }
  return (
    <>
      <h2 className="text-sm-center mb-5 mb-sm-4.5 text-left recommendations-container__heading">
        {formatMessage(messages['recommendation.page.heading'])}
      </h2>
      {personalizedRecommendations.length > 0 && (
        <>
          <h3 className="text-sm-center mb-3 text-left">
            {formatMessage(messages['recommendation.option.recommended.for.you'])}
          </h3>
          <RecommendationsList
            recommendations={personalizedRecommendations}
            userId={userId}
          />
        </>
      )}
      <h3 className="text-sm-center mb-3 text-left">
        {formatMessage(messages['recommendation.option.popular'])}
      </h3>
      <RecommendationsList
        recommendations={popularProducts}
        userId={userId}
      />
      <h3 className="text-sm-center mb-3 text-left">
        {formatMessage(messages['recommendation.option.trending'])}
      </h3>
      <RecommendationsList
        recommendations={trendingProducts}
        userId={userId}
      />
    </>
  );
};

RecommendationsLargeLayout.propTypes = {
  userId: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  personalizedRecommendations: PropTypes.arrayOf(PropTypes.shape({})),
  trendingProducts: PropTypes.arrayOf(PropTypes.shape({})),
  popularProducts: PropTypes.arrayOf(PropTypes.shape({})),
};

RecommendationsLargeLayout.defaultProps = {
  isLoading: true,
  personalizedRecommendations: [],
  trendingProducts: [],
  popularProducts: [],
};

export default RecommendationsLargeLayout;
