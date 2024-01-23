import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import { CheckCircle, Error } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';
import {
  COMPLETE_STATE, FORBIDDEN_STATE, FORM_SUBMISSION_ERROR, INTERNAL_SERVER_ERROR,
} from '../data/constants';
import { PASSWORD_RESET } from '../reset-password/data/constants';

const ForgotPasswordAlert = (props) => {
  const { formatMessage } = useIntl();
  const { email, emailError } = props;
  let message = '';
  let heading = formatMessage(messages['forgot.password.error.alert.title']);
  let { status } = props;

  if (emailError) {
    status = FORM_SUBMISSION_ERROR;
  }

  switch (status) {
    case COMPLETE_STATE:
      heading = formatMessage(messages['confirmation.message.title']);
      message = (
        <FormattedMessage
          id="forgot.password.confirmation.message"
          defaultMessage="We sent an email to {email} with instructions to reset your password.
          If you do not receive a password reset message after 1 minute, verify that you entered
          the correct email address, or check your spam folder. If you need further assistance, {supportLink}."
          description="Forgot password confirmation message"
          values={{
            email: <span className="data-hj-suppress">{email}</span>,
            supportLink: (
              <Alert.Link href={getConfig().PASSWORD_RESET_SUPPORT_LINK} target="_blank">
                {formatMessage(messages['confirmation.support.link'])}
              </Alert.Link>
            ),
          }}
        />
      );
     break;
    case INTERNAL_SERVER_ERROR:
      message = formatMessage(messages['internal.server.error']);
      break;
    case FORBIDDEN_STATE:
      heading = formatMessage(messages['forgot.password.error.message.title']);
      message = formatMessage(messages['forgot.password.request.in.progress.message']);
      break;
    case FORM_SUBMISSION_ERROR:
      message = formatMessage(messages['extend.field.errors'], { emailError });
      break;
    case PASSWORD_RESET.INVALID_TOKEN:
      heading = formatMessage(messages['invalid.token.heading']);
      message = formatMessage(messages['invalid.token.error.message']);
      break;
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
      heading = formatMessage(messages['token.validation.rate.limit.error.heading']);
      message = formatMessage(messages['token.validation.rate.limit.error']);
      break;
    case PASSWORD_RESET.INTERNAL_SERVER_ERROR:
      heading = formatMessage(messages['token.validation.internal.sever.error.heading']);
      message = formatMessage(messages['token.validation.internal.sever.error']);
      break;
    default:
      break;
  }

  if (message) {
    return (
      <Alert
        id="validation-errors"
        className="mb-4"
        variant={`${status === 'complete' ? 'success' : 'danger'}`}
        icon={status === 'complete' ? CheckCircle : Error}
      >
        <Alert.Heading>{heading}</Alert.Heading>
        <p>{message}</p>
      </Alert>
    );
  }
  return null;
};

ForgotPasswordAlert.defaultProps = {
  email: '',
  emailError: '',
};

ForgotPasswordAlert.propTypes = {
  status: PropTypes.string.isRequired,
  email: PropTypes.string,
  emailError: PropTypes.string,
};

export default ForgotPasswordAlert;
