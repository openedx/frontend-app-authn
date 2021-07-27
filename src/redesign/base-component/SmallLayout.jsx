import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@edx/paragon';

import messages from './messages';

const SmallLayout = (props) => {
  const { intl } = props;

  return (
    <>
      <div className="small-screen-header-primary">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="d-flex mt-3">
          <svg className="small-screen-svg-line">
            <line x1="55" y1="0" x2="40" y2="65" />
          </svg>
          <h1 className="small-heading pb-3">
            {intl.formatMessage(messages['start.learning'])}
            <br />
            <span className="text-accent-a">
              {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
            </span>
          </h1>
        </div>
      </div>
    </>
  );
};

SmallLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SmallLayout);
