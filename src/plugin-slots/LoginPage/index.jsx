import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PropTypes from 'prop-types';

import LoginPage from '../../login/LoginPage';

const LoginPageSlot = ({
  institutionLogin,
  handleInstitutionLogin,
}) => (
  <PluginSlot
    id="login_page_slot"
  >
    <LoginPage
      institutionLogin={institutionLogin}
      handleInstitutionLogin={handleInstitutionLogin}
    />
  </PluginSlot>
);

LoginPageSlot.propTypes = {
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

export default LoginPageSlot;
