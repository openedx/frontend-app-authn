import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';

import messages from './messages';

const SmallLayout = ({ intl }) => (
  <span className="bg-primary-400 w-100">
    <div className="col-md-12 small-screen-top-stripe" />
    <div>
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo-small" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <h1 className="text-white mt-3.5 mb-3.5 ml-4.5 mr-3">
        {intl.formatMessage(messages['start.learning'])}
        <span className="text-accent-a ml-2">
          {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
        </span>
      </h1>
    </div>
  </span>
);

SmallLayout.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SmallLayout);
