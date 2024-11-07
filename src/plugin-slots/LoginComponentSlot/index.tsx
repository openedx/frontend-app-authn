import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import LoginPage from '../../login/LoginPage';

const LoginComponentSlot = ({
  institutionLogin,
  handleInstitutionLogin,
}: {
  institutionLogin: boolean,
  handleInstitutionLogin: (value: boolean) => void,
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

export default LoginComponentSlot;
