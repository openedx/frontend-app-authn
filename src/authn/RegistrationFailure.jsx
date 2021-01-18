import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

const hasNoErrors = (userErrors) => (
  userErrors.every((errorList) => (!errorList[0]))
);

const RegistrationFailureMessage = (props) => {
  const errorMessage = props.errors;
  const userErrors = [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [errorMessage]);

  Object.keys(errorMessage).forEach((key) => {
    const errors = errorMessage[key];
    const errorList = errors.map((error) => (
      (error.user_message) ? (
        <li key={error} className="text-left">
          {error.user_message}
        </li>
      ) : null
    ));
    userErrors.push(errorList);
  });

  return (
    hasNoErrors(userErrors) ? null : (
      <Alert variant="danger">
        <Alert.Heading className="text-danger">
          <FormattedMessage
            id="authn.registration.request.failure.header.description.message"
            defaultMessage="We couldn't create your account."
            description="error message when registration failure."
          />
        </Alert.Heading>
        <div>
          <ul>
            {userErrors}
          </ul>
        </div>
      </Alert>
    )
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
