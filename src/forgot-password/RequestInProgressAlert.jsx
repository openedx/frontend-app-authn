import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';

import messages from './messages';

const RequestInProgressAlert = (props) => {
  const { intl } = props;

  return (
    <Alert variant="danger">
      <Alert.Heading>{intl.formatMessage(messages['forgot.password.error.message.title'])}</Alert.Heading>
      <ul>
        <li>{intl.formatMessage(messages['forgot.password.request.in.progress.message'])}</li>
      </ul>
    </Alert>
  );
};

RequestInProgressAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RequestInProgressAlert);
