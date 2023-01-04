import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import messages from './messages';

const LargeLayout = ({ intl }) => (
  <div className="w-50 d-flex">
    <div className="col-md-9 bg-primary-400">
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo position-absolute" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="min-vh-100 d-flex align-items-center">
        <div className={classNames({ 'large-yellow-line mr-n4.5': getConfig().SITE_NAME === 'edX' })} />
        <h1
          className={classNames(
            'display-2 text-white mw-xs',
            { 'ml-6': getConfig().SITE_NAME !== 'edX' },
          )}
        >
          {intl.formatMessage(messages['start.learning'])}
          <div className="text-accent-a">
            {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
          </div>
        </h1>
      </div>
    </div>
    <div className="col-md-3 bg-white p-0">
      <svg className="ml-n1 w-100 h-100 large-screen-svg-primary" preserveAspectRatio="xMaxYMin meet">
        <g transform="skewX(171.6)">
          <rect x="0" y="0" height="100%" width="100%" />
        </g>
      </svg>
    </div>
  </div>
);

LargeLayout.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default injectIntl(LargeLayout);
