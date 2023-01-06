import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { CheckCircle, Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import {
  COMPLETE_STATE, FORBIDDEN_STATE, FORM_SUBMISSION_ERROR, INTERNAL_SERVER_ERROR,
} from '../data/constants';
import { PASSWORD_RESET } from '../reset-password/data/constants';
import messages from './messages';

const ForgotPasswordAlert = (props) => {
  const { email, emailError, intl } = props;
  let message = '';
  let heading = intl.formatMessage(messages['forgot.password.error.alert.title']);
  let { status } = props;

  if (emailError) {
    status = FORM_SUBMISSION_ERROR;
  }

  switch (status) {
    case COMPLETE_STATE:
      heading = intl.formatMessage(messages['confirmation.message.title']);
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
                {intl.formatMessage(messages['confirmation.support.link'])}
              </Alert.Link>
            ),
          }}
        />
      );
     break;
    case INTERNAL_SERVER_ERROR:
      message = intl.formatMessage(messages['internal.server.error']);
      break;
    case FORBIDDEN_STATE:
      heading = intl.formatMessage(messages['forgot.password.error.message.title']);
      message = intl.formatMessage(messages['forgot.password.request.in.progress.message']);
      break;
    case FORM_SUBMISSION_ERROR:
      message = intl.formatMessage(messages['extend.field.errors'], { emailError });
      break;
    case PASSWORD_RESET.INVALID_TOKEN:
      heading = intl.formatMessage(messages['invalid.token.heading']);
      message = intl.formatMessage(messages['invalid.token.error.message']);
      break;
    case PASSWORD_RESET.FORBIDDEN_REQUEST:
      heading = intl.formatMessage(messages['token.validation.rate.limit.error.heading']);
      message = intl.formatMessage(messages['token.validation.rate.limit.error']);
      break;
    case PASSWORD_RESET.INTERNAL_SERVER_ERROR:
      heading = intl.formatMessage(messages['token.validation.internal.sever.error.heading']);
      message = intl.formatMessage(messages['token.validation.internal.sever.error']);
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
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  emailError: PropTypes.string,
};

export default injectIntl(ForgotPasswordAlert);
