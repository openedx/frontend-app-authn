import React, { useEffect, useState } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Skeleton } from '@edx/paragon';
import PropTypes from 'prop-types';

import { PERSONALIZED, POPULAR, TRENDING } from '../data/constants';
import loadingCoursesPlaceholders from '../data/loadingCoursesPlaceholders';
import messages from '../messages';
import RecommendationsList from '../RecommendationsList';
import { trackRecommendationsViewed } from '../track';

const RecommendationsSmallLayout = (props) => {
  const {
    userId,
    isLoading,
    personalizedRecommendations,
    trendingProducts,
    popularProducts,
  } = props;
  const { formatMessage } = useIntl();

  const [hasViewedPopularRecommendations, setHasViewedPopularRecommendations] = useState(false);
  const [hasViewedTrendingRecommendations, setHasViewedTrendingRecommendations] = useState(false);

  useEffect(() => {
    if (!isLoading && personalizedRecommendations.length > 0) {
      trackRecommendationsViewed(personalizedRecommendations, PERSONALIZED, userId);
    } else if (!isLoading && personalizedRecommendations.length === 0) {
      trackRecommendationsViewed(popularProducts, POPULAR, userId);
      setHasViewedPopularRecommendations(true);
    }
  }, [isLoading, personalizedRecommendations, popularProducts, userId]);

  const handlePopularRecommendationsViewed = () => {
    if (!hasViewedPopularRecommendations) {
      setHasViewedPopularRecommendations(true);
      trackRecommendationsViewed(popularProducts, POPULAR, userId);
    }
  };

  const handleTrendingRecommendationsViewed = () => {
    if (!hasViewedTrendingRecommendations) {
      setHasViewedTrendingRecommendations(true);
      trackRecommendationsViewed(trendingProducts, TRENDING, userId);
    }
  };

  if (isLoading) {
    return (
      <>
        <Skeleton />
        <Skeleton />
        <Skeleton className="mb-3" />
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
      <h3 className="text-sm-center mb-4.5 text-left recommendations-container__heading">
        {formatMessage(messages['recommendation.page.heading'])}
      </h3>
      {personalizedRecommendations.length > 0 && (
        <Collapsible
          styling="basic"
          title={formatMessage(messages['recommendation.option.recommended.for.you'])}
          defaultOpen
        >
          <RecommendationsList
            recommendations={personalizedRecommendations}
            userId={userId}
          />
        </Collapsible>
      )}
      <Collapsible
        styling="basic"
        title={formatMessage(messages['recommendation.option.popular'])}
        onOpen={handlePopularRecommendationsViewed}
        defaultOpen={!isLoading && personalizedRecommendations.length === 0}
      >
        <RecommendationsList
          recommendations={popularProducts}
          userId={userId}
        />
      </Collapsible>
      <Collapsible
        styling="basic"
        title={formatMessage(messages['recommendation.option.trending'])}
        onOpen={handleTrendingRecommendationsViewed}
      >
        <RecommendationsList
          recommendations={trendingProducts}
          userId={userId}
        />
      </Collapsible>
    </>
  );
};

RecommendationsSmallLayout.propTypes = {
  userId: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  personalizedRecommendations: PropTypes.arrayOf(PropTypes.shape({})),
  trendingProducts: PropTypes.arrayOf(PropTypes.shape({})),
  popularProducts: PropTypes.arrayOf(PropTypes.shape({})),
};

RecommendationsSmallLayout.defaultProps = {
  isLoading: true,
  personalizedRecommendations: [],
  trendingProducts: [],
  popularProducts: [],
};

export default RecommendationsSmallLayout;
