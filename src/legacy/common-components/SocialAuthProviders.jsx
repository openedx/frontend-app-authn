import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';
import { LOGIN_PAGE, SUPPORTED_ICON_CLASSES } from '../data/constants';

function SocialAuthProviders(props) {
  const { intl, referrer, socialAuthProviders } = props;

  function handleSubmit(e) {
    e.preventDefault();

    const url = e.currentTarget.dataset.providerUrl;
    window.location.href = getConfig().LMS_BASE_URL + url;
  }

  const socialAuth = socialAuthProviders.map((provider, index) => (
    <button
      id={provider.id}
      key={provider.id}
      type="button"
      className={`btn-social btn-${provider.id} ${index % 2 === 0 ? 'mr-3' : ''}`}
      data-provider-url={referrer === LOGIN_PAGE ? provider.loginUrl : provider.registerUrl}
      onClick={handleSubmit}
    >
      {provider.iconImage ? (
        <div className="ml-auto" aria-hidden="true">
          <img className="icon-image" src={provider.iconImage} alt={`icon ${provider.name}`} />
        </div>
      )
        : (
          <>
            <div className="font-container" aria-hidden="true">
              <FontAwesomeIcon
                icon={SUPPORTED_ICON_CLASSES.includes(provider.iconClass) ? ['fab', provider.iconClass] : faSignInAlt}
              />
            </div>
          </>
        )}
      <span id="provider-name" className="mr-auto pl-2" aria-hidden="true">{provider.name}</span>
      <span className="sr-only">
        {referrer === LOGIN_PAGE
          ? intl.formatMessage(messages['sso.sign.in.with'], { providerName: provider.name })
          : intl.formatMessage(messages['sso.create.account.using'], { providerName: provider.name })}
      </span>
    </button>
  ));

  return <>{socialAuth}</>;
}

SocialAuthProviders.defaultProps = {
  referrer: LOGIN_PAGE,
  socialAuthProviders: [],
};

SocialAuthProviders.propTypes = {
  intl: intlShape.isRequired,
  referrer: PropTypes.string,
  socialAuthProviders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    iconClass: PropTypes.string,
    iconImage: PropTypes.string,
    loginUrl: PropTypes.string,
    registerUrl: PropTypes.string,
  })),
};

export default injectIntl(SocialAuthProviders);
