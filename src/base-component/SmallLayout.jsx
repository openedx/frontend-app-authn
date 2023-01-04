import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import messages from './messages';

const SmallLayout = ({ intl }) => (
  <span className="bg-primary-400 w-100">
    <div className="col-md-12 small-screen-top-stripe" />
    <div>
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo-small" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="d-flex align-items-center mb-3 mt-3 mr-3">
        <div className={classNames({ 'small-yellow-line mr-n2.5': getConfig().SITE_NAME === 'edX' })} />
        <h1
          className={classNames(
            'text-white mt-3.5 mb-3.5',
            { 'ml-4.5': getConfig().SITE_NAME !== 'edX' },
          )}
        >
          <span className="mr-1">{intl.formatMessage(messages['start.learning'])}</span>
          <span className="text-accent-a d-inline-block">
            {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
          </span>
        </h1>
      </div>
    </div>
  </span>
);

SmallLayout.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default injectIntl(SmallLayout);
