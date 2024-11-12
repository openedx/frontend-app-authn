import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import classNames from 'classnames';
import loginLogo from './login-logo.png';
import loginBG from './login-bg.jpg';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div className="w-50 d-flex">
      <div
        className="col-md-9"
        
      >
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
          <Image style={{ width: "600px" }} alt="Login Logo" src={loginLogo} />
        </div>
      </div>
    </div>
  );
};

export default LargeLayout;
