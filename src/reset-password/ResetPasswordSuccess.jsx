import React from 'react';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const ResetPasswordSuccess = (props) => {
  const { intl } = props;

  return (
    <Alert id="reset-password-success" variant="success" className="mb-4">
      <Alert.Heading>
        {intl.formatMessage(messages['reset.password.success.heading'])}
      </Alert.Heading>
      <p>{intl.formatMessage(messages['reset.password.success'])}</p>
    </Alert>
  );
};

ResetPasswordSuccess.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default injectIntl(ResetPasswordSuccess);
