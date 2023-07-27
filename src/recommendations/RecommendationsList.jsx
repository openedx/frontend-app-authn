import React from 'react';

import PropTypes from 'prop-types';

import ProductCard from './ProductCard';

const RecommendationsList = (props) => {
  const { recommendations, userId } = props;

  return (
    <div className="d-flex recommendations-container__card-list">
      {
        recommendations.map((recommendation, idx) => (
          <ProductCard
            key={recommendation.activeRunKey}
            product={recommendation}
            position={idx}
            userId={userId}
          />
        ))
      }
    </div>
  );
};

RecommendationsList.propTypes = {
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    activeRunKey: PropTypes.string.isRequired,
  })),
  userId: PropTypes.number,
};

RecommendationsList.defaultProps = {
  recommendations: [],
  userId: null,
};

export default RecommendationsList;
