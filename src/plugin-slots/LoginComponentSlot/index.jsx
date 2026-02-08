import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PropTypes from 'prop-types';

import LoginPage from '../../login/LoginPage';

const LoginComponentSlot = ({
  institutionLogin,
  handleInstitutionLogin,
}) => (
  <PluginSlot
    id="org.openedx.frontend.authn.login_component.v1"
    pluginProps={{
      isInstitutionLogin: institutionLogin,
      setInstitutionLogin: handleInstitutionLogin,
    }}
  >
    <LoginPage
      institutionLogin={institutionLogin}
      handleInstitutionLogin={handleInstitutionLogin}
    />
  </PluginSlot>
);

LoginComponentSlot.propTypes = {
  institutionLogin: PropTypes.bool,
  handleInstitutionLogin: PropTypes.func,
};

export default LoginComponentSlot;
