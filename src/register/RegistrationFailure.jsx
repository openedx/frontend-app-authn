import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { INTERNAL_SERVER_ERROR } from '../login/data/constants';
import messages from './messages';

const RegistrationFailureMessage = (props) => {
  const errorMessage = props.errors;
  const { errorCode } = props.errors;
  const userErrors = [];

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [props.submitCount]);

  let serverError;
  switch (errorCode) {
    case INTERNAL_SERVER_ERROR:
      serverError = (
        <li key={INTERNAL_SERVER_ERROR} className="text-left">
          {props.intl.formatMessage(messages['registration.request.server.error'])}
        </li>
      );
     userErrors.push(serverError);
     break;

     default:
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
  }

  return (
    !userErrors.length ? null : (
      <Alert variant="danger">
        <Alert.Heading>
          {props.intl.formatMessage(messages['registration.request.failure.header'])}
        </Alert.Heading>

        <ul>
          {userErrors}
        </ul>

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
    errorCode: PropTypes.string,
  }),
  submitCount: PropTypes.number,
  intl: intlShape.isRequired,
};

export default injectIntl(RegistrationFailureMessage);
