import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible, Skeleton } from '@edx/paragon';
import PropTypes from 'prop-types';

import loadingCoursesPlaceholders from '../data/loadingCoursesPlaceholders';
import messages from '../messages';
import RecommendationsList from '../RecommendationsList';

const RecommendationsSmallLayout = (props) => {
  const {
    userId,
    isLoading,
    personalizedRecommendations,
    trendingProducts,
    popularProducts,
  } = props;
  const { formatMessage } = useIntl();

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
      >
        <RecommendationsList
          recommendations={popularProducts}
          userId={userId}
        />
      </Collapsible>
      <Collapsible
        styling="basic"
        title={formatMessage(messages['recommendation.option.trending'])}
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
