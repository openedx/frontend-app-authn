import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';

const ConfirmationAlert = (props) => {
  const { email } = props;

  const technicalSupportLink = (
    <Hyperlink
      destination="https://support.edx.org/hc/en-us/articles/206212088-What-if-I-did-not-receive-a-password-reset-message-"
    >
      <FormattedMessage
        id="authn.forgot.password.confirmation.support.link"
        defaultMessage="contact technical support"
        description="link text used in message: authn.forgot.password.confirmation.support.link 'contact technical support.'"
      />
    </Hyperlink>
  );

  const strongEmail = (<strong>{email}</strong>);
  const lineBreak = (<br />);

  return (
    <Alert
      variant="success"
    >
      <Alert.Heading className="text-success">
        <FormattedMessage
          id="authn.forgot.password.confirmation.title"
          defaultMessage="Check Your Email"
          description="Forgot password confirmation title"
        />
      </Alert.Heading>
      <FormattedMessage
        id="authn.forgot.password.confirmation.message"
        defaultMessage="You entered {strongEmail}. If this email address is associated with your edX account, we will send a message with password recovery instructions to this email address. {lineBreak}If you do not receive a password reset message after 1 minute, verify that you entered the correct email address, or check your spam folder.{lineBreak} If you need further assistance, {technicalSupportLink}."
        description="Forgot password confirmation message"
        values={{
          strongEmail,
          technicalSupportLink,
          lineBreak,
        }}
      />
    </Alert>
  );
};

ConfirmationAlert.propTypes = {
  email: PropTypes.string.isRequired,
};

export default ConfirmationAlert;
