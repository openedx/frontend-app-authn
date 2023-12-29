import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import { FORM_SUBMISSION_ERROR, PASSWORD_RESET, PASSWORD_VALIDATION_ERROR } from './data/constants';
import messages from './messages';

const ResetPasswordFailure = (props) => {
  const { formatMessage } = useIntl();
  const { errorCode, errorMsg } = props;

  let errorMessage = null;
  let heading = formatMessage(messages['reset.password.failure.heading']);
  switch (errorCode) {
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
      heading = formatMessage(messages['reset.server.rate.limit.error']);
      errorMessage = formatMessage(messages['rate.limit.error']);
      break;
    case PASSWORD_RESET.INTERNAL_SERVER_ERROR:
      errorMessage = formatMessage(messages['internal.server.error']);
      break;
    case PASSWORD_VALIDATION_ERROR:
      errorMessage = errorMsg;
     break;
    case FORM_SUBMISSION_ERROR:
      errorMessage = formatMessage(messages['reset.password.form.submission.error']);
      break;
    default:
      break;
  }

  if (errorMessage) {
    return (
      <Alert id="validation-errors" className="mb-5" variant="danger" icon={Error}>
        <Alert.Heading>{heading}</Alert.Heading>
        <p>{errorMessage}</p>
      </Alert>
    );
  }

  return null;
};

ResetPasswordFailure.defaultProps = {
  errorCode: null,
  errorMsg: null,
};

ResetPasswordFailure.propTypes = {
  errorCode: PropTypes.string,
  errorMsg: PropTypes.string,
};

export default ResetPasswordFailure;
