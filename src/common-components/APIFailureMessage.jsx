import React from 'react';
import { Alert } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import messages from './messages';

const APIFailureMessage = (props) => {
  const { intl, header } = props;

  return (
    <div className="d-flex justify-content-center">
      <div className="d-flex flex-column mw-500">
        <Alert id="internal-server-error" variant="danger">
          <Alert.Heading>
            {header}
          </Alert.Heading>
          {intl.formatMessage(messages['internal.server.error.message'])}
        </Alert>
      </div>
    </div>
  );
};

APIFailureMessage.propTypes = {
  intl: intlShape.isRequired,
  header: PropTypes.string.isRequired,
};

export default injectIntl(APIFailureMessage);
