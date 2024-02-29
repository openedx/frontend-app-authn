import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const MediumLayout = ({ fullName }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className="w-100 medium-screen-top-stripe" />
      <div className="w-100 p-0 mb-3 d-flex">
        <div className="col-md-10 bg-light-200">
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image className="logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_URL} />
          </Hyperlink>
          <div className="d-flex align-items-center justify-content-center mb-4 ml-5">
            <div className="medium-yellow-line mt-5 mr-n2" />
            <div>
              <h1 className="h3 data-hj-suppress mw-320">
                {formatMessage(messages['welcome.to.platform'], { siteName: getConfig().SITE_NAME, fullName })}
              </h1>
              <h2 className="display-1">
                {formatMessage(messages['complete.your.profile.1'])}
                <div className="text-accent-a">
                  {formatMessage(messages['complete.your.profile.2'])}
                </div>
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-2 bg-white p-0">
          <svg className="w-100 h-100 medium-screen-svg-light" preserveAspectRatio="xMaxYMin meet">
            <g transform="skewX(168)">
              <rect x="0" y="0" height="100%" width="100%" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
};

MediumLayout.propTypes = {
  fullName: PropTypes.string.isRequired,
};

export default MediumLayout;
