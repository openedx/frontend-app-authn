import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const SmallScreenHeader = (props) => {
  const { intl } = props;

  return (
    <>
      <div className="small-screen-top-stripe" />
      <div className="bg-primary">
        <img alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
        <div className="d-flex mt-3">
          <svg className="small-screen-svg-line">
            <line x1="55" y1="0" x2="40" y2="65" />
          </svg>
          <h1 className="small-heading">
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

SmallScreenHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SmallScreenHeader);
