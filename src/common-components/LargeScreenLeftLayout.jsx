import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const LargeScreenLeftLayout = (props) => {
  const { intl } = props;

  return (
    <div className="min-vh-100 pr-0 mt-lg-n2 d-flex align-items-center">
      <svg className="svg-line pl-5">
        <line x1="50" y1="0" x2="10" y2="215" />
      </svg>
      <h1 className="large-heading">
        {intl.formatMessage(messages['start.learning'])}
        <span className="text-accent-a"><br />
          {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
        </span>
      </h1>
    </div>
  );
};

LargeScreenLeftLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LargeScreenLeftLayout);
