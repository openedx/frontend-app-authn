import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@edx/paragon';

import messages from './messages';

const MediumScreenHeader = (props) => {
  const { intl } = props;

  return (
    <div className="container row p-0 mb-3 medium-screen-container">
      <div className="col-md-10 p-0 screen-header">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="row mt-4 justify-content-center">
          <svg className="medium-screen-svg-line pl-5">
            <line x1="50" y1="0" x2="10" y2="215" />
          </svg>
          <h1 className="medium-heading pb-4">
            {intl.formatMessage(messages['start.learning'])}
            <span className="text-accent-a"><br />
              {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
            </span>
          </h1>
        </div>
      </div>
      <div className="col-md-2 p-0 screen-polygon">
        <svg width="100%" height="100%" className="medium-screen-svg" preserveAspectRatio="xMaxYMin meet">
          <g transform="skewX(168)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

MediumScreenHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MediumScreenHeader);
