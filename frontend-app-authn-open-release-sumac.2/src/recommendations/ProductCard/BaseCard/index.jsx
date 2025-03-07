import React from 'react';

import { Badge, Card, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';

import { truncateText } from '../../data/utils';

const BaseCard = ({
  customHeaderImage,
  schoolLogo,
  title,
  uuid,
  subtitle,
  variant,
  productTypeCopy,
  footer,
  handleOnClick,
  isLoading,
  redirectUrl,
}) => (
  <div className="recommendation-card" key={`container-${uuid}`}>
    <Hyperlink
      target="_blank"
      className="card-box d-inline"
      showLaunchIcon={false}
      destination={redirectUrl}
      onClick={handleOnClick}
    >
      <Card
        className={`base-card ${variant}`}
        variant={variant}
        isLoading={isLoading}
      >
        <Card.ImageCap
          className="base-card-image-show optanon-category-C0001"
          src={customHeaderImage}
          srcAlt={`header image for ${subtitle}`}
          logoSrc={schoolLogo}
          logoAlt={`logo for ${subtitle}`}
          imageLoadingType="lazy"
        />
        <Card.Header
          className="mt-2"
          title={truncateText(title, 50)}
          subtitle={truncateText(subtitle, 30)}
        />
        <Card.Section className="d-flex">
          <div className="product-badge">
            <Badge>
              {productTypeCopy}
            </Badge>
          </div>
          <div className="footer-content mt-2">
            {footer}
          </div>
        </Card.Section>
      </Card>
    </Hyperlink>
  </div>
);

BaseCard.propTypes = {
  title: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
  footer: PropTypes.element.isRequired,
  productTypeCopy: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired,
  customHeaderImage: PropTypes.string.isRequired,
  schoolLogo: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  redirectUrl: PropTypes.string.isRequired,
  handleOnClick: PropTypes.func.isRequired,
};

BaseCard.defaultProps = {
  isLoading: false,
};
export default BaseCard;
