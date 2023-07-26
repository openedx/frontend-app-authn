import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Launch } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { isEdxProgram } from '../../data/utils';
import {
  cardFooterMessages,
  externalLinkIconMessages,
} from '../../messages';

const ProductCardFooter = ({
  factoid,
  quickFacts,
  courseLength,
  footerMessage,
  cardType,
  is2UDegreeProgram,
  isSubscriptionView,
}) => {
  const intl = useIntl();
  const courseLengthLabel = courseLength > 1 ? 'Courses' : 'Course';

  if (isSubscriptionView) {
    return (
      <p className="d-inline-block x-small">
        {intl.formatMessage(
          cardFooterMessages[
            'recommendation.2u-product-card.footer-text.number-of-courses'
          ],
          { length: courseLength, label: courseLengthLabel },
        )}
        <span className="p-2">•</span>
        <p className="d-inline-block">
          {intl.formatMessage(
            cardFooterMessages[
              'recommendation.2u-product-card.footer-text.subscription'
            ],
          )}
        </p>
      </p>
    );
  }

  if (footerMessage) {
    return (
      <div className="footer-message d-flex align-items-center">
        <p className="x-small">{footerMessage}</p>
        <Icon
          src={Launch}
          className="ml-1 footer-icon"
          screenReaderText={intl.formatMessage(
            externalLinkIconMessages[
              'recommendation.2u-product-card.launch-icon.sr-text'
            ],
          )}
        />
      </div>
    );
  }

  if (courseLength) {
    return (
      <p className="x-small">
        {intl.formatMessage(
          cardFooterMessages[
            'recommendation.2u-product-card.footer-text.number-of-courses'
          ],
          { length: courseLength, label: courseLengthLabel },
        )}
      </p>
    );
  }

  if (isEdxProgram({ cardType, is2UDegreeProgram })) {
    if (quickFacts && quickFacts.length > 0) {
      const quickFactsCount = quickFacts.length;

      const threeFactsArrangement = [1, 3, 0];
      const twoFactsArrangement = [0, 2];
      return (
        <>
          {(quickFactsCount > 3 ? threeFactsArrangement : twoFactsArrangement)
            .map((index) => quickFacts[index])
            .filter(Boolean)
            .map((fact, idx) => (
              <p key={fact.text} className="d-inline-block x-small">
                {idx > 0 && <span className="p-2">•</span>}
                {fact && fact.text}
              </p>
            ))}
        </>
      );
    }
  }

  if (factoid) {
    return <p className="x-small">{factoid}</p>;
  }

  return null;
};

ProductCardFooter.propTypes = {
  cardType: PropTypes.string,
  factoid: PropTypes.string,
  footerMessage: PropTypes.string,
  quickFacts: PropTypes.arrayOf(PropTypes.shape({})),
  courseLength: PropTypes.number,
  is2UDegreeProgram: PropTypes.bool,
  isSubscriptionView: PropTypes.bool,
};

ProductCardFooter.defaultProps = {
  cardType: '',
  factoid: '',
  footerMessage: '',
  quickFacts: [],
  courseLength: undefined,
  is2UDegreeProgram: false,
  isSubscriptionView: false,
};

export default ProductCardFooter;
