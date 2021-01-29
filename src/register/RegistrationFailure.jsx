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
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [props.submitCount]);

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
        <Alert.Heading>
          <FormattedMessage
            id="registration.request.failure.header.description.message"
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
  submitCount: 0,
};

RegistrationFailureMessage.propTypes = {
  errors: PropTypes.shape({
    email: PropTypes.array,
    username: PropTypes.array,
  }),
  submitCount: PropTypes.number,
};

export default RegistrationFailureMessage;
