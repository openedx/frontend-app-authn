import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert } from '@edx/paragon';

const ResetFailureMessage = (props) => {
  const errorMessage = props.errors;
  return (
    <div className="d-flex justify-content-center reset-password-container">
      <div className="d-flex flex-column" style={{ width: '400px' }}>
        <div className="form-group">
          <div className="text-center mt-3">
            <Alert variant="danger">
              <div style={{ color: '#a0050e' }}>
                <FormattedMessage
                  id="logistration.reset.password.request.failure.header.message"
                  defaultMessage="{errorMessage} "
                  description="error message when password reset failure."
                  values={{
                    errorMessage,
                  }}
                />
              </div>
            </Alert>
          </div>
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
