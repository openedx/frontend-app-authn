import React from 'react';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@edx/paragon';
import PropTypes from 'prop-types';

import RecommendationCard from './RecommendationCard';

const RecommendationsList = (props) => {
  const { title, recommendations } = props;

  return (
    <Container id="course-recommendations" size="lg" className="recommendations-container">
      <h2 className="text-sm-center mb-4 text-left recommendations-heading">
        {title}
      </h2>
      <div className="d-flex card-list">
        {
          recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.activeRunKey}
              recommendation={recommendation}
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
    activeRunKey: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    cardImageUrl: PropTypes.string.isRequired,
    owners: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      logoImageUrl: PropTypes.string.isRequired,
    })),
    marketingUrl: PropTypes.string.isRequired,
  })),
};

RecommendationsList.defaultProps = {
  recommendations: [],
};

export default injectIntl(RecommendationsList);
