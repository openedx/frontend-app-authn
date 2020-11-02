import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert } from '@edx/paragon';


const RegistrationFailureMessage = (props) => {
  const errorMessage = props.errors;
  const userErrors = [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [errorMessage]);

  Object.keys(errorMessage).forEach((key) => {
    const errors = errorMessage[key];
    const errorList = errors.map((error) => {
      const errorMsg = error.user_message;
      return (
        <li key={error} style={{ textAlign: 'left' }}>
          {errorMsg}
        </li>
      );
    });
    userErrors.push(errorList);
  });

  return (
    <Alert variant="danger">
      <h4 style={{ color: '#a0050e' }}>
        <FormattedMessage
          id="logistration.registration.request.failure.header.description.message"
          defaultMessage="We couldn't create your account."
          description="error message when registration failure."
        />
      </h4>
      <div>
        <ul>
          {userErrors}
        </ul>
      </div>
    </Alert>
  );
};

RegistrationFailureMessage.defaultProps = {
  errors: '',
};
RegistrationFailureMessage.propTypes = {
  errors: PropTypes.shape({
    email: PropTypes.array,
    username: PropTypes.array,
  }),
};

export default RegistrationFailureMessage;
