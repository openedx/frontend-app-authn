import React, { useEffect } from 'react';

import { injectIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { windowScrollTo } from '../data/utils';
import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_SESSION_EXPIRED } from './data/constants';
import messages from './messages';

const RegistrationFailureMessage = (props) => {
  const {
    context, errorCode, failureCount, intl,
  } = props;

  useEffect(() => {
    windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [errorCode, failureCount]);

  if (!errorCode) {
    return null;
  }

  let errorMessage;
  switch (errorCode) {
    case INTERNAL_SERVER_ERROR:
      errorMessage = intl.formatMessage(messages['registration.request.server.error']);
     break;
    case FORBIDDEN_REQUEST:
      errorMessage = intl.formatMessage(messages['registration.rate.limit.error']);
      break;
    case TPA_SESSION_EXPIRED:
      errorMessage = intl.formatMessage(messages['registration.tpa.session.expired'], { provider: context.provider });
      break;
    default:
      errorMessage = intl.formatMessage(messages['registration.empty.form.submission.error']);
      break;
  }

  return (
    <Alert id="validation-errors" className="mb-5" variant="danger" icon={Error}>
      <Alert.Heading>{props.intl.formatMessage(messages['registration.request.failure.header'])}</Alert.Heading>
      <p>{errorMessage}</p>
    </Alert>
  );
};

RegistrationFailureMessage.defaultProps = {
  context: {},
};

RegistrationFailureMessage.propTypes = {
  context: PropTypes.shape({
    provider: PropTypes.string,
  }),
  errorCode: PropTypes.string.isRequired,
  failureCount: PropTypes.number.isRequired,
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default injectIntl(RegistrationFailureMessage);
