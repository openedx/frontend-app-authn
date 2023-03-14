import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthService } from '@edx/frontend-platform/auth';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  Tab,
  Tabs,
} from '@edx/paragon';
import { ChevronLeft } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import BaseComponent from '../base-component';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { getTpaHint, getTpaProvider, updatePathWithQueryParams } from '../data/utils';
import { LoginPage } from '../login';
import { RegistrationPage } from '../register';
import { backupRegistrationForm } from '../register/data/actions';
import {
  tpaProvidersSelector,
} from './data/selectors';
import messages from './messages';

const Logistration = (props) => {
  const { intl, selectedPage, tpaProviders } = props;
  const tpaHint = getTpaHint();
  const {
    providers, secondaryProviders,
  } = tpaProviders;
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');
  const disablePublicAccountCreation = getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false;

  useEffect(() => {
    const authService = getAuthService();
    if (authService) {
      authService.getCsrfTokenService().getCsrfToken(getConfig().LMS_BASE_URL);
    }
  });

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    if (typeof e === 'string') {
      sendPageEvent('login_and_registration', e === '/login' ? 'login' : 'register');
    } else {
      sendPageEvent('login_and_registration', e.target.dataset.eventName);
    }

    setInstitutionLogin(!institutionLogin);
  };

  const handleOnSelect = (tabKey) => {
    sendTrackEvent(`edx.bi.${tabKey.replace('/', '')}_form.toggled`, { category: 'user-engagement' });
    if (tabKey === LOGIN_PAGE) {
      props.backupRegistrationForm();
    }
    setKey(tabKey);
  };

  const tabTitle = (
    <div className="d-flex">
      <Icon src={ChevronLeft} className="left-icon" />
      <span className="ml-2">
        {selectedPage === LOGIN_PAGE
          ? intl.formatMessage(messages['logistration.sign.in'])
          : intl.formatMessage(messages['logistration.register'])}
      </span>
    </div>
  );

  const isValidTpaHint = () => {
    const { provider } = getTpaProvider(tpaHint, providers, secondaryProviders);
    return !!provider;
  };

  return (
    <BaseComponent>
      <div>
        {disablePublicAccountCreation
          ? (
            <>
              <Redirect to={updatePathWithQueryParams(LOGIN_PAGE)} />
              {institutionLogin && (
                <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
                  <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
                </Tabs>
              )}
              <div id="main-content" className="main-content">
                {!institutionLogin && (
                  <h3 className="mb-4.5">{intl.formatMessage(messages['logistration.sign.in'])}</h3>
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
                : (!isValidTpaHint() && (
                  <>
                    <Tabs defaultActiveKey={selectedPage} id="controlled-tab" onSelect={handleOnSelect}>
                      <Tab title={intl.formatMessage(messages['logistration.register'])} eventKey={REGISTER_PAGE} />
                      <Tab title={intl.formatMessage(messages['logistration.sign.in'])} eventKey={LOGIN_PAGE} />
                    </Tabs>
                  </>
                ))}
              { key && (
                <Redirect to={updatePathWithQueryParams(key)} />
              )}
              <div id="main-content" className="main-content">
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
    </BaseComponent>
  );
};

Logistration.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  selectedPage: PropTypes.string,
  backupRegistrationForm: PropTypes.func.isRequired,
  tpaProviders: PropTypes.shape({
    providers: PropTypes.array,
    secondaryProviders: PropTypes.array,
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
    backupRegistrationForm,
  },
)(injectIntl(Logistration));
