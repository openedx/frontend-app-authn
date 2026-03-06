import { Slot } from '@openedx/frontend-base';
import PropTypes from 'prop-types';

import LoginPage from '../../login/LoginPage';

const LoginComponentSlot = ({
  institutionLogin,
  handleInstitutionLogin,
}) => (
  <Slot
    id="org.openedx.frontend.slot.authn.loginComponent.v1"
    institutionLogin={institutionLogin}
    handleInstitutionLogin={handleInstitutionLogin}
  >
    <LoginPage
      institutionLogin={institutionLogin}
      handleInstitutionLogin={handleInstitutionLogin}
    />
  </Slot>
);

LoginComponentSlot.propTypes = {
  institutionLogin: PropTypes.bool,
  handleInstitutionLogin: PropTypes.func,
};

export default LoginComponentSlot;
