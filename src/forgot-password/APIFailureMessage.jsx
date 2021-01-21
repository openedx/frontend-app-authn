import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

const APIFailureMessage = () => (
  <div className="d-flex justify-content-center m-4">
    <div className="d-flex flex-column">
      <div className="text-center mw-500">
        <Alert variant="danger">
          <Alert.Heading className="text-danger">
            <FormattedMessage
              id="logistration.forgot.password.request.server.error.header.message"
              defaultMessage="Failed to Send Forgot Password Email"
              description="Failed to Send Forgot Password Email help text heading."
            />
          </Alert.Heading>
          <FormattedMessage
            id="login.internal.server.error.message"
            defaultMessage="An error has occurred. Try refreshing the page, or check your Internet connection."
            description="Error message that appears when server responds with 500 error code"
          />
        </Alert>
      </div>
    </div>
  </div>
);

export default APIFailureMessage;
