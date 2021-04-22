import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';
import { LoginPage } from '../login';
import { RegistrationPage } from '../register';

const Logistration = (props) => {
  const { intl, selectedPage } = props;

  return (
    <div>
      <span className="nav nav-tabs">
        <Link className={`nav-item nav-link ${selectedPage === REGISTER_PAGE ? 'active' : ''}`} to={updatePathWithQueryParams(REGISTER_PAGE)}>
          {intl.formatMessage(messages['logistration.register'])}
        </Link>
        <Link className={`nav-item nav-link ${selectedPage === LOGIN_PAGE ? 'active' : ''}`} to={updatePathWithQueryParams(LOGIN_PAGE)}>
          {intl.formatMessage(messages['logistration.login'])}
        </Link>
      </span>
      <div id="main-content" className="main-content">
        {selectedPage === LOGIN_PAGE ? <LoginPage /> : <RegistrationPage />}
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
