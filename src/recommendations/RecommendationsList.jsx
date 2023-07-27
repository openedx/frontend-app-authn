import React from 'react';

import PropTypes from 'prop-types';

import ProductCard from './ProductCard';

const RecommendationsList = (props) => {
  const { recommendations, userId } = props;

  return (
    <div className="d-flex recommendations-container__card-list">
      {
        recommendations.map((recommendation, idx) => (
          <span key={recommendation.uuid}>
            <ProductCard
              product={recommendation}
              position={idx}
              userId={userId}
            />
          </span>
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
};

RecommendationsList.defaultProps = {
  recommendations: [],
  userId: null,
};

export default RecommendationsList;
