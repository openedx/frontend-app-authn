import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthService } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
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
import { getTpaHint, updatePathWithQueryParams } from '../data/utils';
import { LoginPage } from '../login';
import { RegistrationPage } from '../register';
import { backupRegistrationForm } from '../register/data/actions';
import messages from './messages';

const Logistration = (props) => {
  const { intl, selectedPage } = props;
  const tpa = getTpaHint();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');

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

  return (
    <BaseComponent>
      <div>
        {institutionLogin
          ? (
            <Tabs defaultActiveKey="" id="controlled-tab" onSelect={handleInstitutionLogin}>
              <Tab title={tabTitle} eventKey={selectedPage === LOGIN_PAGE ? LOGIN_PAGE : REGISTER_PAGE} />
            </Tabs>
          )
          : (
            <>
              {!tpa && (
                <Tabs defaultActiveKey={selectedPage} id="controlled-tab" onSelect={handleOnSelect}>
                  <Tab title={intl.formatMessage(messages['logistration.register'])} eventKey={REGISTER_PAGE} />
                  <Tab title={intl.formatMessage(messages['logistration.sign.in'])} eventKey={LOGIN_PAGE} />
                </Tabs>
              )}
            </>
          )}
        { key && (
          <Redirect to={updatePathWithQueryParams(key)} />
        )}
        <div id="main-content" className="main-content">
          {selectedPage === LOGIN_PAGE
            ? <LoginPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />
            : <RegistrationPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />}
        </div>
      </div>
    </BaseComponent>
  );
};

Logistration.propTypes = {
  intl: intlShape.isRequired,
  selectedPage: PropTypes.string,
  backupRegistrationForm: PropTypes.func.isRequired,
};

Logistration.defaultProps = {
  selectedPage: REGISTER_PAGE,
};

export default connect(
  null,
  {
    backupRegistrationForm,
  },
)(injectIntl(Logistration));
