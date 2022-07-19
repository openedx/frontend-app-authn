import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

const LargeLeftLayout = (props) => {
  const { intl } = props;

  return (
    <div className="min-vh-100 d-flex justify-content-left align-items-center">
      <div className="d-flex pr-0 mt-lg-n2">
        <svg
          role="img"
          aria-label=""
          focusable={false}
          className="large-screen-svg-line ml-5"
        >
          <line x1="50" y1="0" x2="10" y2="215" />
        </svg>
        <div>
          <h1 className="large-heading">
            {intl.formatMessage(messages['start.learning'])}
            <span className="text-accent-a">
              <br />
              {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
            </span>
          </h1>
        </div>
      </div>
    </div>
  );
};

LargeLeftLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LargeLeftLayout);
