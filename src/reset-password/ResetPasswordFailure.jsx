import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { FORM_SUBMISSION_ERROR, PASSWORD_RESET, PASSWORD_VALIDATION_ERROR } from './data/constants';
import messages from './messages';
import { AlertWrapper } from '../shared/index.ts';

const ResetPasswordFailure = (props) => {
  const { formatMessage } = useIntl();
  const { errorCode, errorMsg } = props;

  let errorMessage = null;
  switch (errorCode) {
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
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
      <AlertWrapper
        id="validation-errors"
        status="danger"
      >
        <p>{errorMessage}</p>
      </AlertWrapper>
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
