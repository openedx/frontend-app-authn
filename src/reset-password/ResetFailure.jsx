import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

const ResetFailureMessage = (props) => {
  const errorMessage = props.errors;
  return (
    <div className="d-flex justify-content-center m-4">
      <div className="d-flex flex-column">
        <div className="text-left mw-500">
          <Alert variant="danger">
            <FormattedMessage
              id="reset.password.request.failure.header.message"
              defaultMessage="{errorMessage} "
              description="error message when password reset failure."
              values={{
                errorMessage,
              }}
            />
          </Alert>
        </div>
      </div>
    </div>
  );
};

ResetFailureMessage.defaultProps = {
  errors: '',
};
ResetFailureMessage.propTypes = {
  errors: PropTypes.string,
};

export default ResetFailureMessage;
