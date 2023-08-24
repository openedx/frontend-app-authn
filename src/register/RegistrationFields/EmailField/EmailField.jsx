import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { Close, Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { CONFIRM_EMAIL_FIELD_LABEL, EMAIL_FIELD_LABEL } from './constants';
import validateEmail from './validator';
import { FormGroup } from '../../../common-components';
import { backupRegistrationFormBegin, clearRegistertionBackendError, fetchRealtimeValidations } from '../../data/actions';
import messages from '../../messages';

const EmailField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const {
    handleChange,
    handleErrorChange,
    confirmEmailValue,
  } = props;

  const {
    registrationFormData: backedUpFormData,
    validationApiRateLimited,
  } = useSelector(state => state.register);

  const [emailSuggestion, setEmailSuggestion] = useState({ ...backedUpFormData?.emailSuggestion });

  const handleOnBlur = (e) => {
    const { value } = e.target;
    const { fieldError, confirmEmailError, suggestion } = validateEmail(value, confirmEmailValue, formatMessage);

    handleErrorChange(CONFIRM_EMAIL_FIELD_LABEL, confirmEmailError);
    dispatch(backupRegistrationFormBegin({
      ...backedUpFormData,
      emailSuggestion: { ...suggestion },
    }));
    setEmailSuggestion(suggestion);

    if (fieldError) {
      handleErrorChange(EMAIL_FIELD_LABEL, fieldError);
    } else if (!validationApiRateLimited) {
      dispatch(fetchRealtimeValidations({ email: value }));
    }
  };

  const handleOnFocus = () => {
    handleErrorChange(EMAIL_FIELD_LABEL, '');
    dispatch(clearRegistertionBackendError(EMAIL_FIELD_LABEL));
  };

  const handleSuggestionClick = (event) => {
    event.preventDefault();
    handleErrorChange(EMAIL_FIELD_LABEL, '');
    handleChange({ target: { name: EMAIL_FIELD_LABEL, value: emailSuggestion.suggestion } });
    setEmailSuggestion({ suggestion: '', type: '' });
  };

  const handleSuggestionClosed = () => setEmailSuggestion({ suggestion: '', type: '' });

  const renderEmailFeedback = () => {
    if (emailSuggestion.type === 'error') {
      return (
        <Alert variant="danger" className="email-suggestion-alert-error mt-1" icon={Error}>
          <span className="email-suggestion__text">
            {formatMessage(messages['did.you.mean.alert.text'])}{' '}
            <Alert.Link
              href="#"
              name="email"
              onClick={handleSuggestionClick}
            >
              {emailSuggestion.suggestion}
            </Alert.Link>?
            <Icon src={Close} className="email-suggestion__close" onClick={handleSuggestionClosed} tabIndex="0" />
          </span>
        </Alert>
      );
    }
    return (
      <span id="email-warning" className="small">
        {formatMessage(messages['did.you.mean.alert.text'])}:{' '}
        <Alert.Link
          href="#"
          name="email"
          className="email-suggestion-alert-warning"
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
      handleBlur={handleOnBlur}
      handleFocus={handleOnFocus}
    >
      {emailSuggestion.suggestion ? renderEmailFeedback() : null}
    </FormGroup>
  );
};

EmailField.defaultProps = {
  errorMessage: '',
  confirmEmailValue: null,
};

EmailField.propTypes = {
  errorMessage: PropTypes.string,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
  confirmEmailValue: PropTypes.string,
};

export default EmailField;
