import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

import { SUPPORTED_ICON_CLASSES } from '../data/constants';


function SocialAuthProviders(props) {
  const { socialAuthProviders } = props;

  function handleSubmit(e) {
    e.preventDefault();

    const url = e.currentTarget.dataset.providerUrl;
    window.location.href = getConfig().LMS_BASE_URL + url;
  }

  const socialAuth = socialAuthProviders.map((provider) => (
    <button
      id={provider.id}
      key={provider.id}
      type="button"
      className={`btn-social btn-${provider.id}`}
      data-provider-url={`${provider.loginUrl}`}
      onClick={handleSubmit}
    >
      {provider.iconImage ? (
        <>
          <div aria-hidden="true">
            <img className="icon-image" src={provider.iconImage} alt={`icon ${provider.name}`} />
          </div>
          <span className="pl-2" aria-hidden="true">{provider.name}</span>
        </>
      )
        : (
          <>
            <div className="font-container" aria-hidden="true">
              <FontAwesomeIcon
                icon={SUPPORTED_ICON_CLASSES.includes(provider.iconClass) ? ['fab', provider.iconClass] : faSignInAlt}
              />
            </div>
            <span className="pl-2 provider-name" aria-hidden="true">{provider.name}</span>
          </>
        )}

    </button>
  ));

  return <>{socialAuth}</>;
}

SocialAuthProviders.defaultProps = {
  socialAuthProviders: [],
};

SocialAuthProviders.propTypes = {
  socialAuthProviders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    iconClass: PropTypes.string,
    iconImage: PropTypes.string,
    loginUrl: PropTypes.string,
    registerUrl: PropTypes.string,
  })),
};

export default SocialAuthProviders;
