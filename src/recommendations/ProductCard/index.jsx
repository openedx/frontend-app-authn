import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import BaseCard from './BaseCard';
import Footer from './Footer';
import { createCodeFriendlyProduct, getVariant, useProductType } from '../data/utils';
import {
  cardBadgesMessages,
} from '../messages';
import { trackRecommendationClick } from '../track';

const ProductCard = ({
  product,
  userId,
  position,
  isLoading,
}) => {
  const { formatMessage } = useIntl();

  const productType = useProductType(product?.courseType, product?.type);

  const variant = getVariant(productType);

  const headerImage = product?.cardImageUrl || product?.image?.src;

  const schoolName = product?.organizationShortCodeOverride
    || product?.owners?.[0]?.name
    || product?.authoringOrganizations?.[0]?.name
    || product?.partner;
  const schoolLogo = product?.organizationLogoOverrideUrl
    || product?.logoFilename
    || product?.authoringOrganizations?.[0]?.logoImageUrl
    || product?.owners?.[0]?.logoImageUrl;

  const { owners } = product;
  const multipleSchoolNames = [];
  const isMultipleOwner = owners?.length > 1;

  if ((owners?.length > 1)) {
    owners.forEach((owner, index, arr) => {
      let school;
      if (index === arr.length - 1) {
        school = (
          <span key={owner.name}>{owner.name}</span>
        );
      } else {
        school = (
          <>
            <span key={owner.name}>{owner.name}</span>
            <br />
          </>
        );
      }

      multipleSchoolNames.push(school);
    });
  }

  const productTypeCopy = formatMessage(
    cardBadgesMessages[
      `recommendation.product-card.pill-text.${createCodeFriendlyProduct(productType)}`
    ],
  );
  const handleCardClick = (event) => {
    event.preventDefault();
    trackRecommendationClick(
      product,
      position + 1,
      userId,
    );
  };

  return (
    <BaseCard
      customHeaderImage={headerImage}
      schoolLogo={isMultipleOwner ? '' : schoolLogo}
      title={product.title}
      uuid={product.uuid}
      key={product.uuid}
      subtitle={isMultipleOwner ? multipleSchoolNames : schoolName}
      productTypeCopy={productTypeCopy}
      productType={productType}
      variant={variant}
      isLoading={isLoading}
      redirectUrl={product.url || product?.activeCourseRun?.marketingUrl}
      footer={(
        <Footer
          quickFacts={product.degree?.quickFacts}
          externalUrl={product.additionalMetadata?.externalUrl
            || product.degree?.additionalMetadata?.externalUrl}
          courseLength={product.courses?.length}
          isSubscriptionView={!!product.subscriptionEligible}
          is2UDegreeProgram={product.is2UDegreeProgram}
          cardType={product.cardType}
        />
      )}
      handleOnClick={handleCardClick}
      isSubscriptionView={!!product.subscriptionEligible}
    />
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape([
    PropTypes.shape({}),
  ]).isRequired,
  userId: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
};

ProductCard.defaultProps = {
  isLoading: false,
};
export default ProductCard;
