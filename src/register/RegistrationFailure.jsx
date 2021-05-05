import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import { FORBIDDEN_REQUEST, INTERNAL_SERVER_ERROR, TPA_SESSION_EXPIRED } from './data/constants';
import messages from './messages';
import { windowScrollTo } from '../data/utils';

const RegistrationFailureMessage = (props) => {
  const { context, errorCode, intl } = props;

  useEffect(() => {
    windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [errorCode]);

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
    <Alert id="validation-errors" className="mb-5" variant="danger">
      <Icon src={Info} className="alert-icon" />
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
  intl: intlShape.isRequired,
};

export default injectIntl(RegistrationFailureMessage);
