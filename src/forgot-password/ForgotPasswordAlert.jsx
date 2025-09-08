import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';
import {
  FORBIDDEN_STATE, FORM_SUBMISSION_ERROR, INTERNAL_SERVER_ERROR,
} from '../data/constants';
import { PASSWORD_RESET } from '../reset-password/data/constants';
import { AlertWrapper } from '../shared/index.ts';

const ForgotPasswordAlert = (props) => {
  const { formatMessage } = useIntl();
  const { emailError } = props;
  let message = '';
  // let heading = formatMessage(messages['forgot.password.error.alert.title']);
  let { status } = props;

  if (emailError) {
    status = FORM_SUBMISSION_ERROR;
  }

  switch (status) {
    case INTERNAL_SERVER_ERROR:
      message = formatMessage(messages['internal.server.error']);
      break;
    case FORBIDDEN_STATE:
      // heading = formatMessage(messages['forgot.password.error.message.title']);
      message = formatMessage(messages['forgot.password.request.in.progress.message']);
      break;
    case FORM_SUBMISSION_ERROR:
      message = formatMessage(messages['extend.field.errors'], { emailError });
      break;
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
      // heading = formatMessage(messages['token.validation.rate.limit.error.heading']);
      message = formatMessage(messages['token.validation.rate.limit.error']);
      break;
    case PASSWORD_RESET.INTERNAL_SERVER_ERROR:
      // heading = formatMessage(messages['token.validation.internal.sever.error.heading']);
      message = formatMessage(messages['token.validation.internal.sever.error']);
      break;
    default:
      break;
  }

  if (message) {
    return (
      <AlertWrapper
        status={status}
      >
        <p>{message}</p>
      </AlertWrapper>
    );
  }
  return null;
};

ForgotPasswordAlert.defaultProps = {
  emailError: '',
};

ForgotPasswordAlert.propTypes = {
  status: PropTypes.string.isRequired,
  emailError: PropTypes.string,
};

export default ForgotPasswordAlert;
