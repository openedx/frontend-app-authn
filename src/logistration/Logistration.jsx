import { useEffect, useState } from 'react';

import {
  useAppConfig, getAuthService, getSiteConfig, getUrlByRouteRole,
  sendPageEvent, sendTrackEvent, useIntl,
} from '@openedx/frontend-base';
import {
  Icon,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';

import BaseContainer from '../base-container';
import { ThirdPartyAuthProvider, useThirdPartyAuthContext } from '../common-components/components/ThirdPartyAuthContext';
import messages from '../common-components/messages';
import { loginPath, loginRole, registerPath, registerRole } from '../constants';
import {
  getTpaHint, getTpaProvider, updatePathWithQueryParams,
} from '../data/utils';
import { LoginProvider } from '../login/components/LoginContext';
import { RegistrationPage } from '../register';
import { RegisterProvider } from '../register/components/RegisterContext';
import LoginComponentSlot from '../slots/LoginComponentSlot';

const LogistrationPageInner = ({
  selectedPage,
}) => {
  const tpaHint = getTpaHint();
  const {
    thirdPartyAuthContext,
    clearThirdPartyAuthErrorMessage,
  } = useThirdPartyAuthContext();

  const {
    providers,
    secondaryProviders,
  } = thirdPartyAuthContext;
  const { formatMessage } = useIntl();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');
  const navigate = useNavigate();
  const disablePublicAccountCreation = useAppConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false;
  const hideRegistrationLink = useAppConfig().SHOW_REGISTRATION_LINKS === false;

  useEffect(() => {
    const authService = getAuthService();
    if (authService) {
      authService.getCsrfTokenService()
        .getCsrfToken(getSiteConfig().lmsBaseUrl);
    }
  }, []);

  useEffect(() => {
    if (disablePublicAccountCreation) {
      navigate(updatePathWithQueryParams(getUrlByRouteRole(loginRole)));
    }
  }, [navigate, disablePublicAccountCreation]);

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    if (typeof e === 'string') {
      sendPageEvent('login_and_registration', e === loginPath ? 'login' : 'register');
    } else {
      sendPageEvent('login_and_registration', e.target.dataset.eventName);
    }
    setInstitutionLogin(!institutionLogin);
  };

  const handleOnSelect = (tabKey, currentTab) => {
    if (tabKey === currentTab) {
      return;
    }
    sendTrackEvent(`edx.bi.${tabKey}_form.toggled`, { category: 'user-engagement' });
    clearThirdPartyAuthErrorMessage();
    setKey(tabKey);
  };

  const tabTitle = (
    <div className="d-flex">
      <Icon src={ChevronLeft} className="left-icon" />
      <span className="ml-2">
        {selectedPage === loginPath
          ? formatMessage(messages['logistration.sign.in'])
          : formatMessage(messages['logistration.register'])}
      </span>
    </div>
  );

  const isValidTpaHint = () => {
    const { provider } = getTpaProvider(tpaHint, providers, secondaryProviders);
    return !!provider;
  };

  return (
    <BaseContainer>
      <div>
        {disablePublicAccountCreation
          ? (
            <>
              {institutionLogin && (
                <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                  <Tab title={tabTitle} eventKey={loginPath} />
                </Tabs>
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && (
                  <h3 className="mb-4.5">{formatMessage(messages['logistration.sign.in'])}</h3>
                )}
                <LoginComponentSlot
                  institutionLogin={institutionLogin}
                  handleInstitutionLogin={handleInstitutionLogin}
                />
              </div>
            </>
          )
          : (
            <div>
              {institutionLogin
                ? (
                  <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                    <Tab title={tabTitle} eventKey={selectedPage === loginPath ? loginPath : registerPath} />
                  </Tabs>
                )
                : (!isValidTpaHint() && !hideRegistrationLink && (
                  <Tabs
                    defaultActiveKey={selectedPage}
                    id="controlled-tab"
                    onSelect={(tabKey) => handleOnSelect(tabKey, selectedPage)}
                  >
                    <Tab title={formatMessage(messages['logistration.register'])} eventKey={registerPath} />
                    <Tab title={formatMessage(messages['logistration.sign.in'])} eventKey={loginPath} />
                  </Tabs>
                ))}
              {key && (
                <Navigate to={updatePathWithQueryParams(getUrlByRouteRole(key === loginPath ? loginRole : registerRole))} replace />
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && !isValidTpaHint() && hideRegistrationLink && (
                  <h3 className="mb-4.5">
                    {formatMessage(messages[selectedPage === loginPath ? 'logistration.sign.in' : 'logistration.register'])}
                  </h3>
                )}
                {selectedPage === loginPath
                  ? (
                    <LoginComponentSlot
                      institutionLogin={institutionLogin}
                      handleInstitutionLogin={handleInstitutionLogin}
                    />
                  )
                  : (
                    <RegistrationPage
                      institutionLogin={institutionLogin}
                      handleInstitutionLogin={handleInstitutionLogin}
                    />
                  )}
              </div>
            </div>
          )}
      </div>
    </BaseContainer>
  );
};

LogistrationPageInner.propTypes = {
  selectedPage: PropTypes.string.isRequired,
};

/**
 * Main Logistration Page component wrapped with providers
 */
const LogistrationPage = (props) => (
  <ThirdPartyAuthProvider>
    <RegisterProvider>
      <LoginProvider>
        <LogistrationPageInner {...props} />
      </LoginProvider>
    </RegisterProvider>
  </ThirdPartyAuthProvider>
);

export default LogistrationPage;
