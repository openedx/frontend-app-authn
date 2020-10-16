import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import Alert from '../logistration/Alert';

const InvalidTokenMessage = () => {
  const loginPasswordLink = (
    <Hyperlink destination="/login">
      <FormattedMessage
        id="logistration.forgot.password.confirmation.support.link"
        defaultMessage="sign-in"
        description="link text used in message: logistration.reset.password.request.invalid.token.description.message link 'sign-in.'"
      />
    </Hyperlink>
  );

  const forgotPassword = (<strong>Forgot Password</strong>);
  return (
    <div className="d-flex justify-content-center reset-password-container">
      <div className="d-flex flex-column" style={{ width: '400px' }}>
        <div className="form-group">
          <div className="text-center mt-3">
            <Alert className="alert-danger mt-n2">
              <h4 style={{ color: '#a0050e' }}>
                <FormattedMessage
                  id="logistration.reset.password.request.invalid.token.header.message"
                  defaultMessage="Invalid Password Reset Link"
                  description=""
                />
              </h4>
              <FormattedMessage
                id="logistration.reset.password.request.invalid.token.description.message"
                defaultMessage="This password reset link is invalid. It may have been used already. To reset your password, go to the {loginPasswordLink} page and select {forgotPassword}"
                description=""
                values={{
                  forgotPassword,
                  loginPasswordLink,
                }}
              />
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvalidTokenMessage;
