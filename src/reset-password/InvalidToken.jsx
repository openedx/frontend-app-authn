import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';

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

  const forgotPassword = (
    <strong>
      <FormattedMessage
        id="logistration.reset.password.request.forgot.password.text"
        defaultMessage="Forgot Password"
        description="Forgot password page help text."
      />
    </strong>
  );
  return (
    <div className="d-flex justify-content-center m-4">
      <div className="d-flex flex-column">
        <div className="text-center mw-420">
          <Alert variant="danger">
            <Alert.Heading className="text-danger">
              <FormattedMessage
                id="logistration.reset.password.request.invalid.token.header.message"
                defaultMessage="Invalid Password Reset Link"
                description="Invalid password reset link help text heading."
              />
            </Alert.Heading>
            <FormattedMessage
              id="logistration.reset.password.request.invalid.token.description.message"
              defaultMessage="This password reset link is invalid. It may have been used already. To reset your password, go to the {loginPasswordLink} page and select {forgotPassword}"
              description="Invalid password reset link help text message."
              values={{
                forgotPassword,
                loginPasswordLink,
              }}
            />
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default InvalidTokenMessage;
