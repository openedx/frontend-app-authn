import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Skeleton } from '@openedx/paragon';
import PropTypes from 'prop-types';

import loadingCoursesPlaceholders from '../data/loadingCoursesPlaceholders';
import messages from '../messages';
import RecommendationsList from '../RecommendationsList';

const RecommendationsLargeLayout = (props) => {
  const {
    userId,
    isLoading,
    personalizedRecommendations,
  } = props;
  const { formatMessage } = useIntl();

  if (isLoading) {
    return (
      <>
        <Skeleton height={32} width={300} className="mb-5" />
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
      <span id="recommendations-large-layout">
        <h1 className="h2 text-sm-center mb-5 mb-sm-4.5 text-left recommendations-container__heading">
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

RecommendationsLargeLayout.propTypes = {
  userId: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  personalizedRecommendations: PropTypes.arrayOf(PropTypes.shape({})),
};

RecommendationsLargeLayout.defaultProps = {
  isLoading: true,
  personalizedRecommendations: [],
};

export default RecommendationsLargeLayout;
