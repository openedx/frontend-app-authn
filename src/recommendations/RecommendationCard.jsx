import React from 'react';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Card, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';

import { trackRecommendationsClicked } from './track';

const RecommendationCard = (props) => {
  const { recommendation, position, userId } = props;
  const showPartnerLogo = recommendation.owners.length === 1;

  const getOwners = () => {
    if (recommendation.owners.length === 1) {
      return recommendation.owners[0].key;
    }

    let keys = '';
    recommendation.owners.forEach((owner) => {
      keys += `${owner.key }, `;
    });
    return keys.slice(0, -2);
  };

  const handleCardClick = () => {
    trackRecommendationsClicked(
      recommendation.courseKey,
      false,
      position + 1,
      userId,
      recommendation.marketingUrl,
      recommendation.recommendationType || 'algolia',
    );
  };

  return (
    <div className="mr-4 recommendation-card">
      <Hyperlink
        destination={recommendation.marketingUrl}
        target="_blank"
        showLaunchIcon={false}
        onClick={handleCardClick}
      >
        <Card isClickable>
          <Card.ImageCap
            src={recommendation.cardImageUrl}
            srcAlt="Card image"
            logoSrc={showPartnerLogo ? recommendation.owners[0].logoImageUrl : ''}
            logoAlt="Card logo"
          />
          <Card.Header
            title={recommendation.title}
            subtitle={getOwners()}
          />
          <Card.Section />
          <Card.Footer textElement={<small className="footer-text">Course</small>} />
        </Card>
      </Hyperlink>
    </div>
  );
};

RecommendationCard.propTypes = {
  recommendation: PropTypes.shape({
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
  }).isRequired,
  position: PropTypes.number.isRequired,
  userId: PropTypes.number,
};

RecommendationCard.defaultProps = {
  userId: null,
};

export default injectIntl(RecommendationCard);
