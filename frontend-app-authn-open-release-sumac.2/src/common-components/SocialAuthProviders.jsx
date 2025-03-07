import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Icon } from '@openedx/paragon';
import { Login } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';
import { LOGIN_PAGE, SUPPORTED_ICON_CLASSES } from '../data/constants';

const SocialAuthProviders = (props) => {
  const { formatMessage } = useIntl();
  const { referrer, socialAuthProviders } = props;

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
        <div aria-hidden="true">
          <img className="btn-tpa__image-icon" src={provider.iconImage} alt={`icon ${provider.name}`} />
        </div>
      )
        : (
          <div className="btn-tpa__font-container" aria-hidden="true">
            {SUPPORTED_ICON_CLASSES.includes(provider.iconClass) ? (
              <FontAwesomeIcon icon={['fab', provider.iconClass]} />)
              : (
                <Icon className="h-75" src={Login} />
              )}
          </div>
        )}
      <span id="provider-name" className="notranslate mr-auto pl-2" aria-hidden="true">{provider.name}</span>
      <span className="sr-only">
        {referrer === LOGIN_PAGE
          ? formatMessage(messages['sso.sign.in.with'], { providerName: provider.name })
          : formatMessage(messages['sso.create.account.using'], { providerName: provider.name })}
      </span>
    </button>
  ));

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{socialAuth}</>;
};

SocialAuthProviders.defaultProps = {
  referrer: LOGIN_PAGE,
  socialAuthProviders: [],
};

SocialAuthProviders.propTypes = {
  referrer: PropTypes.string,
  socialAuthProviders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    iconClass: PropTypes.string,
    iconImage: PropTypes.string,
    loginUrl: PropTypes.string,
    registerUrl: PropTypes.string,
    skipRegistrationForm: PropTypes.bool,
  })),
};

export default SocialAuthProviders;
