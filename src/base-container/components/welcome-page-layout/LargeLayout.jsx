import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const LargeLayout = ({ fullName }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="w-50 d-flex">
      <div className="col-md-10 bg-light-200 p-0">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo position-absolute" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
        </Hyperlink>
        <div className="min-vh-100 d-flex align-items-center">
          <div className="large-screen-left-container mr-n4.5 large-yellow-line mt-5" />
          <div>
            <h1 className="welcome-to-platform data-hj-suppress">
              {formatMessage(messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, fullName })}
            </h1>
            <h2 className="complete-your-profile">
              {formatMessage(messages['complete.your.profile.1'])}
              <div className="text-accent-a">
                {formatMessage(messages['complete.your.profile.2'])}
              </div>
            </h2>
          </div>
        </div>
      </div>
      <div className="col-md-2 bg-white p-0">
        <svg className="m1-n1 w-100 h-100 large-screen-svg-light" preserveAspectRatio="xMaxYMin meet">
          <g transform="skewX(171.6)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

LargeLayout.propTypes = {
  fullName: PropTypes.string.isRequired,
};

export default LargeLayout;
