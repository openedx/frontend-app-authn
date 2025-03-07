import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthService } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';

import BaseContainer from '../base-container';
import { clearThirdPartyAuthContextErrorMessage } from '../common-components/data/actions';
import {
  tpaProvidersSelector,
} from '../common-components/data/selectors';
import messages from '../common-components/messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import {
  getTpaHint, getTpaProvider, updatePathWithQueryParams,
} from '../data/utils';
import { LoginPage } from '../login';
import { backupLoginForm } from '../login/data/actions';
import { RegistrationPage } from '../register';
import { backupRegistrationForm } from '../register/data/actions';

const Logistration = (props) => {
  const { selectedPage, tpaProviders } = props;
  const tpaHint = getTpaHint();
  const {
    providers, secondaryProviders,
  } = tpaProviders;
  const { formatMessage } = useIntl();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');
  const navigate = useNavigate();
  const disablePublicAccountCreation = getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false;
  const hideRegistrationLink = getConfig().SHOW_REGISTRATION_LINKS === false;

  useEffect(() => {
    const authService = getAuthService();
    if (authService) {
      authService.getCsrfTokenService().getCsrfToken(getConfig().LMS_BASE_URL);
    }
  });

  useEffect(() => {
    if (disablePublicAccountCreation) {
      navigate(updatePathWithQueryParams(LOGIN_PAGE));
    }
  }, [navigate, disablePublicAccountCreation]);

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    if (typeof e === 'string') {
      sendPageEvent('login_and_registration', e === '/login' ? 'login' : 'register');
    } else {
      sendPageEvent('login_and_registration', e.target.dataset.eventName);
    }

    setInstitutionLogin(!institutionLogin);
  };

  const handleOnSelect = (tabKey, currentTab) => {
    if (tabKey === currentTab) {
      return;
    }
    sendTrackEvent(`edx.bi.${tabKey.replace('/', '')}_form.toggled`, { category: 'user-engagement' });
    props.clearThirdPartyAuthContextErrorMessage();
    if (tabKey === LOGIN_PAGE) {
      props.backupRegistrationForm();
    } else if (tabKey === REGISTER_PAGE) {
      props.backupLoginForm();
    }
    setKey(tabKey);
  };

  const tabTitle = (
    <div className="d-flex">
      <Icon src={ChevronLeft} className="left-icon" />
      <span className="ml-2">
        {selectedPage === LOGIN_PAGE
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
                  <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
                </Tabs>
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && (
                  <h3 className="mb-4.5">{formatMessage(messages['logistration.sign.in'])}</h3>
                )}
                <LoginPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />
              </div>
            </>
          )
          : (
            <div>
              {institutionLogin
                ? (
                  <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                    <Tab title={tabTitle} eventKey={selectedPage === LOGIN_PAGE ? LOGIN_PAGE : REGISTER_PAGE} />
                  </Tabs>
                )
                : (!isValidTpaHint() && !hideRegistrationLink && (
                  <Tabs defaultActiveKey={selectedPage} id="controlled-tab" onSelect={(tabKey) => handleOnSelect(tabKey, selectedPage)}>
                    <Tab title={formatMessage(messages['logistration.register'])} eventKey={REGISTER_PAGE} />
                    <Tab title={formatMessage(messages['logistration.sign.in'])} eventKey={LOGIN_PAGE} />
                  </Tabs>
                ))}
              { key && (
                <Navigate to={updatePathWithQueryParams(key)} replace />
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && !isValidTpaHint() && hideRegistrationLink && (
                  <h3 className="mb-4.5">
                    {formatMessage(messages[selectedPage === LOGIN_PAGE ? 'logistration.sign.in' : 'logistration.register'])}
                  </h3>
                )}
                {selectedPage === LOGIN_PAGE
                  ? <LoginPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />
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

Logistration.propTypes = {
  selectedPage: PropTypes.string,
  backupLoginForm: PropTypes.func.isRequired,
  backupRegistrationForm: PropTypes.func.isRequired,
  clearThirdPartyAuthContextErrorMessage: PropTypes.func.isRequired,
  tpaProviders: PropTypes.shape({
    providers: PropTypes.arrayOf(PropTypes.shape({})),
    secondaryProviders: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

Logistration.defaultProps = {
  tpaProviders: {
    providers: [],
    secondaryProviders: [],
  },
};

Logistration.defaultProps = {
  selectedPage: REGISTER_PAGE,
};

const mapStateToProps = state => ({
  tpaProviders: tpaProvidersSelector(state),
});

export default connect(
  mapStateToProps,
  {
    backupLoginForm,
    backupRegistrationForm,
    clearThirdPartyAuthContextErrorMessage,
  },
)(Logistration);
