import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';


const ResetSuccessMessage = () => {
  const loginPasswordLink = (
    <Alert.Link href="/login" className="font-weight-normal" style={{ color: '#0075b4' }}>
      <FormattedMessage
        id="logistration.reset.password.confirmation.support.link"
        defaultMessage="Sign-in to your account."
        description="link text used in message: logistration.reset.password.invalid.token.description.message link 'sign-in.'"
      />
    </Alert.Link>
  );

  return (
    <div className="d-flex justify-content-center reset-password-container">
      <div className="d-flex flex-column" style={{ width: '400px' }}>
        <div className="form-group">
          <div className="text-center mt-3">
            <Alert variant="success mt-n2">
              <Alert.Heading style={{ color: 'green' }}>
                <FormattedMessage
                  id="logistration.reset.password.request.success.header.message"
                  defaultMessage="Password Reset Complete."
                  description="header message when reset is successful."
                />
              </Alert.Heading>
              <FormattedMessage
                id="logistration.reset.password.request.success.header.description.message"
                defaultMessage="Your password has been reset. {loginPasswordLink}"
                description="message when reset password is successful."
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
