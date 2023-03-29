import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { CheckCircle, Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { ACCOUNT_ACTIVATION_MESSAGE } from './data/constants';
import messages from './messages';

const AccountActivationMessage = (props) => {
  const { formatMessage } = useIntl();
  const { messageType } = props;
  const variant = messageType === ACCOUNT_ACTIVATION_MESSAGE.ERROR ? 'danger' : messageType;

  const activationOrVerification = getConfig().MARKETING_EMAILS_OPT_IN ? 'confirmation' : 'activation';

  let activationMessage;
  let heading;

  const iconMapping = {
    [ACCOUNT_ACTIVATION_MESSAGE.SUCCESS]: CheckCircle,
    [ACCOUNT_ACTIVATION_MESSAGE.ERROR]: Error,
  };

  switch (messageType) {
    case ACCOUNT_ACTIVATION_MESSAGE.SUCCESS: {
      heading = formatMessage(messages[`account.${activationOrVerification}.success.message.title`]);
      activationMessage = <span>{formatMessage(messages[`account.${activationOrVerification}.success.message`])}</span>;
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.INFO: {
      activationMessage = formatMessage(messages[`account.${activationOrVerification}.info.message`]);
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.ERROR: {
      const supportLink = (
        <Alert.Link href={getConfig().ACTIVATION_EMAIL_SUPPORT_LINK}>
          {formatMessage(messages['account.activation.support.link'])}
        </Alert.Link>
      );

      heading = formatMessage(messages[`account.${activationOrVerification}.error.message.title`]);
      activationMessage = (
        <FormattedMessage
          id="account.activation.error.message"
          defaultMessage="Something went wrong, please {supportLink} to resolve this issue."
          description="Account activation error message"
          values={{ supportLink }}
        />
      );
      break;
    }
    default:
      break;
  }

  return activationMessage ? (
    <Alert
      id="account-activation-message"
      className="mb-4"
      variant={variant}
      icon={iconMapping[messageType]}
    >
      {heading && <Alert.Heading>{heading}</Alert.Heading>}
      {activationMessage}
    </Alert>
  ) : null;
};

AccountActivationMessage.propTypes = {
  messageType: PropTypes.string.isRequired,
};

export default AccountActivationMessage;
