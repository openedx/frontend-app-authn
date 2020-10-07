import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import Alert from '../logistration/Alert';

const ResetSuccessMessage = () => {
  const loginPasswordLink = (
    <Hyperlink destination="/login">
      <FormattedMessage
        id="logistration.reset.password.confirmation.support.link"
        defaultMessage="Sign-in"
        description="link text used in message: logistration.reset.password.invalid.token.description.message link 'sign-in.'"
      />
    </Hyperlink>
  );

  return (
    <div className="d-flex justify-content-center reset-password-container">
      <div className="d-flex flex-column" style={{ width: '400px' }}>
        <div className="form-group">
          <div className="text-center mt-3">
            <Alert className="alert-warning mt-n2">
              <h4 style={{ color: 'green' }}>
                <FormattedMessage
                  id="logistration.reset.password.request.success.header.message"
                  defaultMessage="Password Reset Complete."
                  description="whatever"
                />
              </h4>
              <FormattedMessage
                id="logistration.reset.password.request.success.header.description.message"
                defaultMessage="Your password has been reset. {loginPasswordLink} to your account."
                description="whatever"
                values={{
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

export default ResetSuccessMessage;
