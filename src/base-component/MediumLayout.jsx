import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';

import messages from './messages';

const MediumLayout = ({ intl }) => (
  <>
    <div className="w-100 medium-screen-top-stripe" />
    <div className="w-100 p-0 mb-3 d-flex">
      <div className="col-md-10 bg-primary-400">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <h1 className="display-1 text-white mt-5 mb-5 ml-4.5 mr-2">
          {intl.formatMessage(messages['start.learning'])}
          <span className="text-accent-a ml-2">
            {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
          </span>
        </h1>
        <div />
      </div>
      <div className="col-md-2 bg-white p-0">
        <svg className="w-100 h-100 medium-screen-svg-primary" preserveAspectRatio="xMaxYMin meet">
          <g transform="skewX(168)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  </>
);

MediumLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MediumLayout);
