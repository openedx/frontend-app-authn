import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { Close, Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { FormGroup } from '../../common-components';
import messages from '../messages';

const EmailField = (props) => {
  const {
    intl,
    emailSuggestion,
    handleSuggestionClick,
    handleOnClose,
  } = props;

  const renderEmailFeedback = () => {
    if (emailSuggestion.type === 'error') {
      return (
        <Alert variant="danger" className="email-error-alert mt-1" icon={Error}>
          <span className="alert-text">
            {intl.formatMessage(messages['did.you.mean.alert.text'])}{' '}
            <Alert.Link
              href="#"
              name="email"
              onClick={handleSuggestionClick}
            >
              {emailSuggestion.suggestion}
            </Alert.Link>?<Icon src={Close} className="alert-close" onClick={handleOnClose} tabIndex="0" />
          </span>
        </Alert>
      );
    }
    return (
      <span id="email-warning" className="small">
        {intl.formatMessage(messages['did.you.mean.alert.text'])}:{' '}
        <Alert.Link
          href="#"
          name="email"
          className="email-warning-alert-link"
          onClick={handleSuggestionClick}
        >
          {emailSuggestion.suggestion}
        </Alert.Link>?
      </span>
    );
  };

  return (
    <FormGroup
      borderClass={emailSuggestion.type === 'warning' ? 'yellow-border' : ''}
      maxLength={254} // Limit per RFCs is 254
      {...props}
    >
      {emailSuggestion.suggestion ? renderEmailFeedback() : null}
    </FormGroup>
  );
};

EmailField.defaultProps = {
  emailSuggestion: {
    suggestion: '',
    type: '',
  },
  errorMessage: '',
};

EmailField.propTypes = {
  errorMessage: PropTypes.string,
  emailSuggestion: PropTypes.shape({
    suggestion: PropTypes.string,
    type: PropTypes.string,
  }),
  intl: intlShape.isRequired,
  value: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  handleSuggestionClick: PropTypes.func.isRequired,
};

export default injectIntl(EmailField);
