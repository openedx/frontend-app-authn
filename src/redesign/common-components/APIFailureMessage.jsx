import React from 'react';
import { Alert } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import messages from './messages';
import { API_RATELIMIT_ERROR, INTERNAL_SERVER_ERROR } from '../data/constants';

const APIFailureMessage = (props) => {
  const { intl, header, errorCode } = props;
  let errorMessage = null;
  let id = null;

  switch (errorCode) {
    case INTERNAL_SERVER_ERROR:
      id = INTERNAL_SERVER_ERROR;
      errorMessage = intl.formatMessage(messages['internal.server.error.message']);
      break;
    case API_RATELIMIT_ERROR:
      id = API_RATELIMIT_ERROR;
      errorMessage = intl.formatMessage(messages['server.ratelimit.error.message']);
      break;
    default:
      break;
  }

  return (
    <div className="d-flex justify-content-center m-4">
      <div className="d-flex flex-column mw-500">
        <Alert id={id} variant="danger">
          <Alert.Heading>
            {header}
          </Alert.Heading>
          <ul>
            <li key={errorMessage}>
              {errorMessage}
            </li>
          </ul>
        </Alert>
      </div>
    </div>
  );
};

APIFailureMessage.propTypes = {
  intl: intlShape.isRequired,
  header: PropTypes.string.isRequired,
  errorCode: PropTypes.string.isRequired,
};

export default injectIntl(APIFailureMessage);
