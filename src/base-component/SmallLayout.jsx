import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';

import messages from './messages';

const SmallLayout = (props) => {
  const { intl } = props;

  return (
    <>
      <div className="small-screen-header-primary">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="d-flex mt-3">
          <svg
            role="img"
            aria-label=""
            focusable={false}
            className="small-screen-svg-line"
          >
            <line x1="55" y1="0" x2="40" y2="65" />
          </svg>
          <div className="pb-3">
            <h1 className="small-heading">
              {intl.formatMessage(messages['start.learning'])}
              <br />
              <span className="text-accent-a">
                {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
              </span>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

SmallLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SmallLayout);
