import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';


const LargeLayout = ({ fullName = null }) => {
  const { formatMessage } = useIntl();

  const enterpriseBranding = useSelector(
    state => state.commonComponents?.thirdPartyAuthContext?.enterpriseBranding,
  );

  const enterpriseLogoUrl = enterpriseBranding?.enterpriseLogoUrl || null;
  const enterpriseName = enterpriseBranding?.enterpriseName || null;

  const enterpriseWelcomeHtml =
    enterpriseBranding?.enterpriseBrandedWelcomeString
    || enterpriseBranding?.platformWelcomeString
    || '';

  const siteName = getConfig().SITE_NAME;
  const baseLogoSrc = getConfig().LOGO_WHITE_URL || getConfig().LOGO_URL;

  return (
    <div className="w-50 d-flex">
      <div className="col-md-10 bg-primary-400 auth-hero-left position-relative">
        {/* base edX logo at very top-left */}
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image
            className="logo auth-hero-base-logo"
            alt={siteName}
            src={baseLogoSrc}
          />
        </Hyperlink>

        {/* main hero content block, aligned like Figma */}
        <div className="auth-hero-content d-flex flex-column">
          {/* row: [enterprise logo] [yellow slash] [Start learning with edX] */}
          <div className="d-flex align-items-center">
            {enterpriseLogoUrl && (
              <div className="auth-hero-enterprise-logo-wrapper mr-4">
                <Image
                  alt={enterpriseName || 'Enterprise'}
                  src={enterpriseLogoUrl}
                  className="auth-hero-enterprise-logo"
                />
              </div>
            )}

            <div className="auth-hero-slash" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="191" height="250" viewBox="0 0 191 250" fill="none" style={{ width: '100%', height: '100%' }}>
                <line x1="69.8107" y1="33.833" x2="32.9503" y2="206.952" stroke="#F0CC00" strokeWidth="8" />
              </svg>
            </div>

            <div className="auth-hero-heading">
              <div
                className={classNames(
                  'auth-hero-heading-line text-white',
                )}
              >
                {formatMessage(messages['start.learning'])}
              </div>
              <div className="auth-hero-heading-line text-accent-a">
                {formatMessage(messages['with.edx'])}
              </div>
            </div>
          </div>

          {/* enterprise-specific message aligned under heading */}
          {enterpriseWelcomeHtml && (
            <div
              className="auth-hero-message mt-4"
              dangerouslySetInnerHTML={{ __html: enterpriseWelcomeHtml }}
            />
          )}
        </div>
      </div>

      {/* keep existing right decorative triangle */}
      <div className="col-md-3 bg-white p-0">
        <svg
          className="m1-n1 w-100 h-100 large-screen-svg-primary"
          preserveAspectRatio="xMaxYMin meet"
        >
          <g transform="skewX(171.6)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

LargeLayout.propTypes = {
  fullName: PropTypes.string,
};

export default LargeLayout;