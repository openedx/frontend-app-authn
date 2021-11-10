import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Tabs,
  Tab,
  Icon,
} from '@edx/paragon';
import { ChevronLeft } from '@edx/paragon/icons';

import messages from './messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { updatePathWithQueryParams, getTpaHint } from '../data/utils';
import { LoginPage } from '../login';
import { RegistrationPage } from '../register';
import BaseComponent from '../base-component';

const Logistration = (props) => {
  const { intl, selectedPage } = props;
  const tpa = getTpaHint();
  const [institutionLogin, setInstitutionLogin] = useState(false);
  const [key, setKey] = useState('');

  // TODO: Remove after VAN-704 is complete
  const [registerRenameExpVariation, setRegisterRenameExpVariation] = useState('');

  useEffect(() => {
    const { renameRegisterExperiment } = window;

    if (renameRegisterExperiment) {
      setRegisterRenameExpVariation(renameRegisterExperiment);
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
    <BaseComponent isRegistrationPage={selectedPage === REGISTER_PAGE}>
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
                  <Tab
                    title={registerRenameExpVariation === 'variation1' ? (
                      intl.formatMessage(messages['register.for.free'])
                    ) : intl.formatMessage(messages['logistration.register'])}
                    eventKey={REGISTER_PAGE}
                  />
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
};

Logistration.defaultProps = {
  selectedPage: REGISTER_PAGE,
};

export default injectIntl(Logistration);
