import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import classNames from 'classnames';
import loginLogo from './login-logo.png';
import messages from './messages';

const SmallLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <span className="w-100 d-flex justify-content-center">
      <div>
        <div className="d-flex align-items-center justify-content-center m-3.5">
          <div className={classNames({ 'small-yellow-line mr-n2.5': getConfig().SITE_NAME === 'edX' })} />
          <Image style={{ width: "400px", marginTop: "-100px" }} alt="Login Logo" src={loginLogo} />
        </div>
      </div>
    </span>
  );
};

export default SmallLayout;
