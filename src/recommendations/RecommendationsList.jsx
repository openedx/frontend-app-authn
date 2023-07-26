import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Dropdown, DropdownButton } from '@edx/paragon';
import PropTypes from 'prop-types';

import { RECOMMENDATIONS_OPTION_LIST } from './data/constants';
import messages from './messages';
import ProductCard from './ProductCard';

const RecommendationsList = (props) => {
  const { formatMessage } = useIntl();

  const {
    title, recommendations, userId, setSelectedRecommendationsType, selectedRecommendationsType,
  } = props;

  return (
    <Container id="course-recommendations" size="lg" className="recommendations-container">
      <h2 className="text-sm-center mb-4 text-left recommendations-container__heading">
        {title}
      </h2>
      <DropdownButton
        id="dropdown-basic-button"
        title={(
          <>
            {formatMessage(messages[`recommendation.option.${selectedRecommendationsType.value}`])}
          </>
        )}
        className="bg-white mt-5.5 mb-3"
      >
        {RECOMMENDATIONS_OPTION_LIST.map((option) => (
          <Dropdown.Item
            onClick={() => setSelectedRecommendationsType(option)}
            id={`option-${option.value}`}
            key={`option-${option.value}`}
          >
            {formatMessage(messages[`recommendation.option.${option.value}`])}
          </Dropdown.Item>
        ))}
      </DropdownButton>
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
    </Container>
  );
};

RecommendationsList.propTypes = {
  title: PropTypes.string.isRequired,
  setSelectedRecommendationsType: PropTypes.func.isRequired,
  selectedRecommendationsType: PropTypes.shape({
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
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
