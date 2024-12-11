import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div className="w-50 d-flex bg-primary-400 authn-container">
      <div className="col-md-10">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo position-absolute" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="min-vh-100 d-flex align-items-center">
          <div className={classNames({ 'large-yellow-line mr-n4.5': getConfig().SITE_NAME === 'edX' })} />
          <h1
            className={classNames(
              'display-2 text-white mw-xs',
              { 'ml-6': getConfig().SITE_NAME !== 'edX' },
            )}
          >
            {formatMessage(messages['start.learning'])}
            <div className="text-accent-a">
              {formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
            </div>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LargeLayout;
