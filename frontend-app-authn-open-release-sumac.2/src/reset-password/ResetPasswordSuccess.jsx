import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';

import messages from './messages';

const ResetPasswordSuccess = () => {
  const { formatMessage } = useIntl();

  return (
    <Alert id="reset-password-success" variant="success" className="mb-5">
      <Alert.Heading>
        {formatMessage(messages['reset.password.success.heading'])}
      </Alert.Heading>
      <p>{formatMessage(messages['reset.password.success'])}</p>
    </Alert>
  );
};

export default ResetPasswordSuccess;
