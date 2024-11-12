import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import classNames from 'classnames';
import loginLogo from './login-logo.png';
import messages from './messages';

const MediumLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className="w-100 p-0 mb-3 d-flex justify-content-center align-items-center">
        <div className="col-md-10 d-flex justify-content-center align-items-center">
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className={classNames({ 'mt-1 medium-yellow-line': getConfig().SITE_NAME === 'edX' })} />
            <div className="d-flex justify-content-center">
              <Image style={{ width: "600px", marginTop:"-180px" }} alt="Login Logo" src={loginLogo} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediumLayout;
