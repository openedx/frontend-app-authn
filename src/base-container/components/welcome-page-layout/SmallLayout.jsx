import React from 'react';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import messages from './messages';

const SmallLayout = ({ fullName = null }) => {
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
    <div className="min-vw-100 bg-primary-400 auth-hero-left">
      <div className="col-md-12 small-screen-top-stripe" />
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo-small auth-hero-base-logo" alt={siteName} src={baseLogoSrc} />
      </Hyperlink>

      <div className="auth-hero-content d-flex flex-column">
        <div className="d-flex align-items-center">
          {enterpriseLogoUrl && (
            <div className="auth-hero-enterprise-logo-wrapper mr-3">
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
            <div className="auth-hero-heading-line text-white">
              {formatMessage(messages['start.learning'])}
            </div>
            <div className="auth-hero-heading-line text-accent-a">
              {formatMessage(messages['with.site.name'], { siteName })}
            </div>
          </div>
        </div>

        {enterpriseWelcomeHtml && (
          <div
            className="auth-hero-message mt-3"
            dangerouslySetInnerHTML={{ __html: enterpriseWelcomeHtml }}
          />
        )}
      </div>
    </div>
  );
};

SmallLayout.propTypes = {
  fullName: PropTypes.string,
};

SmallLayout.defaultProps = {
  fullName: null,
};

export default SmallLayout;