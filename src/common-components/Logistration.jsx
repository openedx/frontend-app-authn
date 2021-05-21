import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { updatePathWithQueryParams, getTpaHint } from '../data/utils';
import { LoginPage } from '../login';
import { RegistrationPage } from '../register';

const Logistration = (props) => {
  const { intl, selectedPage } = props;
  const tpa = getTpaHint();
  const [institutionLogin, setInstitutionLogin] = useState(false);

  const handleInstitutionLogin = (e) => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    sendPageEvent('login_and_registration', e.target.dataset.eventName);

    setInstitutionLogin(!institutionLogin);
  };

  return (
    <div>
      {institutionLogin
        ? (
          <span className="nav nav-tabs mt-2 pb-2">
            <FontAwesomeIcon className="mr-2 mt-1 ml-3" icon={faChevronLeft} />
            <Button
              variant="link"
              className="nav-item p-0 mb-1 logistration-button"
              data-event-name={selectedPage === LOGIN_PAGE ? 'login' : 'register'}
              onClick={handleInstitutionLogin}
            >
              {selectedPage === LOGIN_PAGE
                ? intl.formatMessage(messages['logistration.sign.in'])
                : intl.formatMessage(messages['logistration.register'])}
            </Button>
          </span>
        )
        : {!tpa
        && (
          <span className="nav nav-tabs">
            <Link className={`nav-item nav-link ${selectedPage === REGISTER_PAGE ? 'active' : ''}`} to={updatePathWithQueryParams(REGISTER_PAGE)}>
              {intl.formatMessage(messages['logistration.register'])}
            </Link>
            <Link className={`nav-item nav-link ${selectedPage === LOGIN_PAGE ? 'active' : ''}`} to={updatePathWithQueryParams(LOGIN_PAGE)}>
              {intl.formatMessage(messages['logistration.sign.in'])}
            </Link>
          </span>
      )}
      <div id="main-content" className="main-content">
        {selectedPage === LOGIN_PAGE
          ? <LoginPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />
          : <RegistrationPage institutionLogin={institutionLogin} handleInstitutionLogin={handleInstitutionLogin} />}
      </div>
    </div>
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
