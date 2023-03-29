import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const AuthSmallLayout = ({ username }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="min-vw-100 bg-light-200">
      <div className="col-md-12 small-screen-top-stripe" />
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo-small" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
      </Hyperlink>
      <div className="d-flex align-items-center mb-3 mt-3 mr-3">
        <div className="small-yellow-line mt-4.5" />
        <div>
          <h1 className="h5 data-hj-suppress">
            {formatMessage(messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, username })}
          </h1>
          <h2 className="h1">
            {formatMessage(messages['complete.your.profile.1'])}
            <div className="text-accent-a">
              {formatMessage(messages['complete.your.profile.2'])}
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
};

AuthSmallLayout.propTypes = {
  username: PropTypes.string.isRequired,
};

export default AuthSmallLayout;
