import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { FORM_SUBMISSION_ERROR, PASSWORD_RESET, PASSWORD_VALIDATION_ERROR } from './data/constants';
import messages from './messages';

const ResetPasswordFailure = (props) => {
  const { errorCode, errorMsg, intl } = props;

  let errorMessage = null;
  let heading = intl.formatMessage(messages['reset.password.failure.heading']);
  switch (errorCode) {
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
      heading = intl.formatMessage(messages['reset.server.rate.limit.error']);
      errorMessage = intl.formatMessage(messages['rate.limit.error']);
      break;
    case PASSWORD_RESET.INTERNAL_SERVER_ERROR:
      errorMessage = intl.formatMessage(messages['internal.server.error']);
      break;
    case PASSWORD_VALIDATION_ERROR:
      errorMessage = errorMsg;
     break;
    case FORM_SUBMISSION_ERROR:
      errorMessage = intl.formatMessage(messages['reset.password.form.submission.error']);
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
  intl: intlShape.isRequired,
};

export default injectIntl(ResetPasswordFailure);
