import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { CheckCircle } from '@edx/paragon/icons';

import messages from './messages';

const SuccessAlert = (props) => {
  const { email, intl } = props;

  return (
    <Alert id="forgotpassword-success-alert" variant="success">
      <Icon src={CheckCircle} className="alert-icon" />
      <Alert.Heading>{intl.formatMessage(messages['confirmation.message.title'])}</Alert.Heading>
      <p>
        <FormattedMessage
          id="forgot.password.confirmation.message"
          defaultMessage="We sent an email to {email} with instructions to reset your password.
           If you do not receive a password reset message after 1 minute, verify that you entered
           the correct email address, or check your spam folder. If you need further assistance, {supportLink}."
          description="Forgot password confirmation message"
          values={{
            email: <span className="data-hj-suppress">{email}</span>,
            supportLink: (
              <Alert.Link className="alert-link" href={getConfig().PASSWORD_RESET_SUPPORT_LINK}>
                {intl.formatMessage(messages['confirmation.support.link'])}
              </Alert.Link>
            ),
          }}
        />
      </p>
    </Alert>
  );
};

SuccessAlert.propTypes = {
  email: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SuccessAlert);
