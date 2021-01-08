import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

const ResetSuccessMessage = () => {
  const loginPasswordLink = (
    <Alert.Link href="/login" className="font-weight-normal text-info">
      <FormattedMessage
        id="logistration.reset.password.confirmation.support.link"
        defaultMessage="Sign-in to your account."
        description="link text used in message: logistration.reset.password.invalid.token.description.message link 'sign-in.'"
      />
    </Alert.Link>
  );

  return (
    <div className="d-flex justify-content-center m-4">
      <div className="d-flex flex-column">
        <div className="text-center mw-500">
          <Alert variant="success">
            <Alert.Heading className="text-success">
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
  );
};

export default ResetSuccessMessage;
