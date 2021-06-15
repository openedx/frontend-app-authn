import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR } from './data/constants';
import messages from './messages';
import { DEFAULT_STATE, PENDING_STATE } from '../data/constants';
import { windowScrollTo } from '../data/utils';

const RegistrationFailureMessage = (props) => {
  const errorMessage = props.errors;
  const { errorCode } = props.errors;
  const userErrors = [];

  useEffect(() => {
    if (props.isSubmitted && props.submitButtonState !== PENDING_STATE) {
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  });

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
    case FORBIDDEN_REQUEST:
      userErrors.push(
        (
          <li key={FORBIDDEN_REQUEST} className="text-left">
            {props.intl.formatMessage(messages['register.rate.limit.reached.message'])}
          </li>
        ),
      );
      break;
    default:
      Object.keys(errorMessage).forEach((key) => {
        if (key !== 'error_code') {
          const errors = errorMessage[key];
          const suppressionClass = ['email', 'username'].includes(key) ? 'data-hj-suppress' : '';
          const errorList = errors.map((error) => (
            (error.user_message) ? (
              <li key={error} className={`text-left ${suppressionClass}`}>
                {error.user_message}
              </li>
            ) : null
          ));
          userErrors.push(errorList);
        }
      });
  }

  return (
    !userErrors.length ? null : (
      <Alert id="validation-errors" variant="danger">
        <Alert.Heading>{props.intl.formatMessage(messages['registration.request.failure.header'])}</Alert.Heading>
        <ul>{userErrors}</ul>
      </Alert>
    )
  );
};

RegistrationFailureMessage.defaultProps = {
  errors: '',
  submitButtonState: DEFAULT_STATE,
  isSubmitted: false,
};

RegistrationFailureMessage.propTypes = {
  errors: PropTypes.shape({
    email: PropTypes.array,
    username: PropTypes.array,
    errorCode: PropTypes.string,
  }),
  submitButtonState: PropTypes.string,
  isSubmitted: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(RegistrationFailureMessage);
