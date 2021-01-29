import React from 'react';
import { Alert } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import messages from './messages';

const APIFailureMessage = (props) => {
  const { intl, header } = props;

  return (
    <Alert variant="danger">
      <Alert.Heading>
        {header}
      </Alert.Heading>
      {intl.formatMessage(messages['internal.server.error.message'])}
    </Alert>
  );
};

APIFailureMessage.propTypes = {
  intl: intlShape.isRequired,
  header: PropTypes.string.isRequired,
};

export default injectIntl(APIFailureMessage);
