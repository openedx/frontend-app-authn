import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

import {
  RenderInstitutionButton,
  SocialAuthProviders,
} from '../common-components';
import {
  PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';
import messages from './messages';

/**
 * This component renders the Single sign-on (SSO) buttons for the providers passed.
 * */
const ThirdPartyAuth = (props) => {
  const {
    providers, secondaryProviders, currentProvider, handleInstitutionLogin, thirdPartyAuthApiStatus, intl,
  } = props;
  const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
  const isSocialAuthActive = !!providers.length && !currentProvider;
  const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;

  return (
    <>
      {((isEnterpriseLoginDisabled && isInstitutionAuthActive) || isSocialAuthActive) && (
        <div className="mt-4 mb-3 h4">
          {intl.formatMessage(messages['registration.other.options.heading'])}
        </div>
      )}

      {thirdPartyAuthApiStatus === PENDING_STATE ? (
        <Skeleton className="tpa-skeleton" height={36} count={2} />
      ) : (
        <>
          {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
            <RenderInstitutionButton
              onSubmitHandler={handleInstitutionLogin}
              buttonTitle={intl.formatMessage(messages['register.institution.login.button'])}
            />
          )}
          {isSocialAuthActive && (
            <div className="row m-0">
              <SocialAuthProviders socialAuthProviders={providers} referrer={REGISTER_PAGE} />
            </div>
          )}
        </>
      )}
    </>
  );
};

ThirdPartyAuth.defaultProps = {
  currentProvider: null,
  providers: [],
  secondaryProviders: [],
  thirdPartyAuthApiStatus: 'pending',
};

ThirdPartyAuth.propTypes = {
  currentProvider: PropTypes.string,
  handleInstitutionLogin: PropTypes.func.isRequired,
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  providers: PropTypes.arrayOf(PropTypes.any),
  secondaryProviders: PropTypes.arrayOf(PropTypes.any),
  thirdPartyAuthApiStatus: PropTypes.string,
};

export default injectIntl(ThirdPartyAuth);
