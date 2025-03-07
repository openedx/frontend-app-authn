import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Skeleton } from '@openedx/paragon';
import PropTypes from 'prop-types';

import loadingCoursesPlaceholders from '../data/loadingCoursesPlaceholders';
import messages from '../messages';
import RecommendationsList from '../RecommendationsList';

const RecommendationsSmallLayout = (props) => {
  const {
    userId,
    isLoading,
    personalizedRecommendations,
  } = props;
  const { formatMessage } = useIntl();

  if (isLoading) {
    return (
      <>
        <Skeleton height={36} className="mb-3" />
        <RecommendationsList
          recommendations={loadingCoursesPlaceholders}
          userId={userId}
          isLoading
        />
      </>
    );
  }

  if (personalizedRecommendations.length) {
    return (
      <span id="recommendations-small-layout">
        <h1 className="h3 text-sm-center mb-4.5 text-left recommendations-container__heading">
          {formatMessage(messages['recommendation.page.heading'])}
        </h1>

        <RecommendationsList
          recommendations={personalizedRecommendations}
          userId={userId}
        />
      </span>
    );
  }

  return null;
};

RecommendationsSmallLayout.propTypes = {
  userId: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  personalizedRecommendations: PropTypes.arrayOf(PropTypes.shape({})),
};

RecommendationsSmallLayout.defaultProps = {
  isLoading: true,
  personalizedRecommendations: [],
};

export default RecommendationsSmallLayout;
