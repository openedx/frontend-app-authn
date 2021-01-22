import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import { ACCOUNT_ACTIVATION_MESSAGE } from './data/constants';
import messages from './messages';

const AccountActivationMessage = (props) => {
  const { intl, messageType } = props;
  const variant = messageType === ACCOUNT_ACTIVATION_MESSAGE.ERROR ? 'danger' : messageType;

  let activationMessage;
  let heading;

  switch (messageType) {
    case ACCOUNT_ACTIVATION_MESSAGE.SUCCESS: {
      heading = intl.formatMessage(messages['authn.account.activation.success.message.title']);
      activationMessage = intl.formatMessage(messages['authn.account.activation.success.message']);
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.INFO: {
      activationMessage = intl.formatMessage(messages['authn.account.already.activated.message']);
      break;
    }
    case ACCOUNT_ACTIVATION_MESSAGE.ERROR: {
      const supportLink = (
        <Alert.Link href={getConfig().ACTIVATION_EMAIL_SUPPORT_LINK}>
          {intl.formatMessage(messages['authn.account.activation.support.link'])}
        </Alert.Link>
      );

      heading = intl.formatMessage(messages['authn.account.activation.error.message.title']);
      activationMessage = (
        <FormattedMessage
          id="authn.account.activation.error.message"
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
    <Alert id="account-activation-message" variant={variant}>
      {heading && <Alert.Heading>{heading}</Alert.Heading>}
      {activationMessage}
    </Alert>
  ) : null;
};

AccountActivationMessage.propTypes = {
  messageType: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(AccountActivationMessage);
