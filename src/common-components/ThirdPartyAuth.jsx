import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Icon,
} from '@openedx/paragon';
import { Institution } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

import messages from './messages';
import {
  ENTERPRISE_LOGIN_URL, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';

import {
  RenderInstitutionButton,
  SocialAuthProviders,
} from './index';

/**
 * This component renders the Single sign-on (SSO) buttons for the providers passed.
 * */
const ThirdPartyAuth = (props) => {
  const { formatMessage } = useIntl();
  const {
    providers,
    secondaryProviders,
    currentProvider,
    handleInstitutionLogin,
    thirdPartyAuthApiStatus,
    isLoginPage,
  } = props;
  const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
  const isSocialAuthActive = !!providers.length && !currentProvider;
  const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;
  const enterpriseLoginURL = getConfig().LMS_BASE_URL + ENTERPRISE_LOGIN_URL;
  const isThirdPartyAuthActive = isSocialAuthActive || (isEnterpriseLoginDisabled && isInstitutionAuthActive);

  return (
    <>
      {((isEnterpriseLoginDisabled && isInstitutionAuthActive) || isSocialAuthActive) && (
        <div className="mt-4 mb-3 h4">
          {isLoginPage
            ? formatMessage(messages['login.other.options.heading'])
            : formatMessage(messages['registration.other.options.heading'])}
        </div>
      )}
      {(isLoginPage && !isEnterpriseLoginDisabled && isSocialAuthActive) && (
        <Hyperlink
          className={classNames(
            'btn btn-link btn-sm text-body p-0',
            { 'mb-0': thirdPartyAuthApiStatus === PENDING_STATE },
            { 'mb-4': thirdPartyAuthApiStatus !== PENDING_STATE },
          )}
          destination={enterpriseLoginURL}
        >
          <Icon src={Institution} className="institute-icon" />
          {formatMessage(messages['enterprise.login.btn.text'])}
        </Hyperlink>
      )}

      {thirdPartyAuthApiStatus === PENDING_STATE && isThirdPartyAuthActive ? (
        <div className="mt-4">
          <Skeleton className="tpa-skeleton" height={36} count={2} />
        </div>
      ) : (
        <>
          {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
            <RenderInstitutionButton
              onSubmitHandler={handleInstitutionLogin}
              buttonTitle={formatMessage(messages['institution.login.button'])}
            />
          )}
          {isSocialAuthActive && (
            <div className="row m-0">
              <SocialAuthProviders
                socialAuthProviders={providers}
                referrer={isLoginPage ? LOGIN_PAGE : REGISTER_PAGE}
              />
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
  thirdPartyAuthApiStatus: PENDING_STATE,
  isLoginPage: false,
};

ThirdPartyAuth.propTypes = {
  currentProvider: PropTypes.string,
  handleInstitutionLogin: PropTypes.func.isRequired,
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      iconClass: PropTypes.string,
      iconImage: PropTypes.string,
      loginUrl: PropTypes.string,
      registerUrl: PropTypes.string,
    }),
  ),
  secondaryProviders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      iconClass: PropTypes.string,
      iconImage: PropTypes.string,
      loginUrl: PropTypes.string,
      registerUrl: PropTypes.string,
    }),
  ),
  thirdPartyAuthApiStatus: PropTypes.string,
  isLoginPage: PropTypes.bool,
};

export default ThirdPartyAuth;
