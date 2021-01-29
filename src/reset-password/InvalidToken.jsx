import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

import messages from './messages';
import { LOGIN_PAGE } from '../data/constants';

const InvalidTokenMessage = props => {
  const { intl } = props;

  const loginPasswordLink = (
    <Alert.Link href={LOGIN_PAGE}>
      {intl.formatMessage(messages['forgot.password.confirmation.sign.in.link'])}
    </Alert.Link>
  );

  return (
    <div className="d-flex justify-content-center m-4">
      <div className="d-flex flex-column mw-500">
        <Alert variant="danger">
          <Alert.Heading> {intl.formatMessage(messages['reset.password.request.invalid.token.header'])}</Alert.Heading>
          <FormattedMessage
            id="reset.password.request.invalid.token.description.message"
            defaultMessage="This password reset link is invalid. It may have been used already.
            To reset your password, go to the {loginPasswordLink} page and select {forgotPassword}"
            description="Invalid password reset link help text message."
            values={{
              forgotPassword: <strong> {intl.formatMessage(messages['reset.password.request.forgot.password.text'])} </strong>,
              loginPasswordLink,
            }}
          />
        </Alert>
      </div>
    </div>
  );
};

InvalidTokenMessage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(InvalidTokenMessage);
