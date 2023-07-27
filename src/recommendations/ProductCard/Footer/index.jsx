import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import {
  cardFooterMessages,
} from '../../messages';

const ProductCardFooter = ({
  factoid,
  quickFacts,
  courseLength,
  cardType,
}) => {
  const intl = useIntl();
  const courseLengthLabel = courseLength > 1 ? 'Courses' : 'Course';

  if (courseLength) {
    return (
      <p className="x-small">
        {intl.formatMessage(
          cardFooterMessages[
            'recommendation.product-card.footer-text.number-of-courses'
          ],
          { length: courseLength, label: courseLengthLabel },
        )}
      </p>
    );
  }

  if (cardType === 'program') {
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
  quickFacts: PropTypes.arrayOf(PropTypes.shape({})),
  courseLength: PropTypes.number,
};

ProductCardFooter.defaultProps = {
  cardType: '',
  factoid: '',
  quickFacts: [],
  courseLength: undefined,
};

export default ProductCardFooter;
