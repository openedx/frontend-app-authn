import React from 'react';

import PropTypes from 'prop-types';

import ProductCard from './ProductCard';

const RecommendationsList = (props) => {
  const { recommendations, userId, isLoading } = props;

  return (
    <div className="d-flex flex-wrap mb-3 recommendations-container__card-list">
      {
        recommendations.map((recommendation, idx) => (
          <ProductCard
            key={recommendation.uuid}
            product={recommendation}
            position={idx}
            userId={userId}
            isLoading={isLoading}
          />
        ))
      }
    </div>
  );
};

RecommendationsList.propTypes = {
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string,
  })),
  userId: PropTypes.number,
  isLoading: PropTypes.bool,
};

RecommendationsList.defaultProps = {
  recommendations: [],
  userId: null,
  isLoading: false,
};

export default RecommendationsList;
