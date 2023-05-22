import React from 'react';

import { Container } from '@edx/paragon';
import PropTypes from 'prop-types';

import RecommendationCard from './RecommendationCard';

const RecommendationsList = (props) => {
  const { title, recommendations, userId } = props;

  return (
    <Container id="course-recommendations" size="lg" className="recommendations-container">
      <h2 className="text-sm-center mb-4 text-left recommendations-container__heading">
        {title}
      </h2>
      <div className="d-flex recommendations-container__card-list">
        {
          recommendations.map((recommendation, idx) => (
            <RecommendationCard
              key={recommendation.activeRunKey}
              recommendation={recommendation}
              position={idx}
              userId={userId}
            />
          ))
        }
      </div>
    </Container>
  );
};

RecommendationsList.propTypes = {
  title: PropTypes.string.isRequired,
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    courseKey: PropTypes.string.isRequired,
    activeRunKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string.isRequired,
    owners: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      logoImageUrl: PropTypes.string.isRequired,
    })),
    marketingUrl: PropTypes.string.isRequired,
    recommendationType: PropTypes.string,
  })),
  userId: PropTypes.number,
};

RecommendationsList.defaultProps = {
  recommendations: [],
  userId: null,
};

export default RecommendationsList;
