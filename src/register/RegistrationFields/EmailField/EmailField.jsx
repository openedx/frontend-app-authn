import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@openedx/paragon';
import { Close, Error } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import validateEmail from './validator';
import { FormGroup } from '../../../common-components';
import {
  clearRegistrationBackendError,
  fetchRealtimeValidations,
  setEmailSuggestionInStore,
} from '../../data/actions';
import messages from '../../messages';

/**
 * Email field wrapper. It accepts following handlers
 * - handleChange for setting value change and
 * - handleErrorChange for setting error
 *
 * It is responsible for
 * - Generating email warning and error suggestions
 * - Setting and clearing email suggestions
 * - Performing email field validations
 * - clearing error on focus
 * - setting value on change
 */
const EmailField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const {
    handleChange,
    handleErrorChange,
    confirmEmailValue,
  } = props;

  const backedUpFormData = useSelector(state => state.register.registrationFormData);
  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);

  const [emailSuggestion, setEmailSuggestion] = useState({ ...backedUpFormData?.emailSuggestion });

  useEffect(() => {
    setEmailSuggestion(backedUpFormData.emailSuggestion);
  }, [backedUpFormData.emailSuggestion]);

  const handleOnBlur = (e) => {
    const { value } = e.target;
    const { fieldError, confirmEmailError, suggestion } = validateEmail(value, confirmEmailValue, formatMessage);

    if (confirmEmailError) {
      handleErrorChange('confirm_email', confirmEmailError);
    }

    dispatch(setEmailSuggestionInStore(suggestion));
    setEmailSuggestion(suggestion);

    if (fieldError) {
      handleErrorChange('email', fieldError);
    } else if (!validationApiRateLimited) {
      dispatch(fetchRealtimeValidations({ email: value }));
    }
  };

  const handleOnFocus = () => {
    handleErrorChange('email', '');
    dispatch(clearRegistrationBackendError('email'));
  };

  const handleSuggestionClick = (event) => {
    event.preventDefault();
    handleErrorChange('email', '');
    handleChange({ target: { name: 'email', value: emailSuggestion.suggestion } });
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
