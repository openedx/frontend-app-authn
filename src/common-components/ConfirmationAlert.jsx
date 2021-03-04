import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

import messages from './messages';

const ConfirmationAlert = (props) => {
  const { email, intl } = props;

  return (
    <Alert id="confirmation-alert" variant="success">
      <Alert.Heading>{intl.formatMessage(messages['forgot.password.confirmation.title'])}</Alert.Heading>
      <p>
        <FormattedMessage
          id="forgot.password.confirmation.message"
          defaultMessage="You entered {strongEmail}. If this email address is associated with your
          edX account, we will send a message with password recovery instructions to this email address."
          description="Forgot password confirmation message"
          values={{ strongEmail: <strong className="data-hj-suppress">{email}</strong> }}
        />
      </p>
      <p>{intl.formatMessage(messages['forgot.password.confirmation.info'])}</p>
      <p>
        <FormattedMessage
          id="forgot.password.technical.support.help.message"
          defaultMessage="If you need further assistance, {technicalSupportLink}."
          description="Message to help user contact technical support"
          values={{
            technicalSupportLink: (
              <Alert.Link href={getConfig().PASSWORD_RESET_SUPPORT_LINK}>
                {intl.formatMessage(messages['forgot.password.confirmation.support.link'])}
              </Alert.Link>
            ),
          }}
        />
      </p>
    </Alert>
  );
};

ConfirmationAlert.propTypes = {
  email: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ConfirmationAlert);
