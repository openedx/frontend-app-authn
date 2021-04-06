import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const MediumScreenTopLayout = (props) => {
  const { intl } = props;

  return (
    <div className="medium-screen-background">
      <img alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
      <div className="row mt-4">
        <svg className="svg-line pl-5">
          <line x1="50" y1="0" x2="10" y2="215" />
        </svg>
        <h1 className="large-heading pb-3">
          {intl.formatMessage(messages['start.learning'])}
          <span className="text-accent-a"><br />
            {intl.formatMessage(messages['with.'], { siteNme: getConfig().SITE_NAME })}
          </span>
        </h1>
      </div>
    </div>
  );
};

MediumScreenTopLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MediumScreenTopLayout);
