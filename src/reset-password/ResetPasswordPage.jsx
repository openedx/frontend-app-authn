import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Alert, Form, Input, StatefulButton, ValidationFormGroup,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getQueryParameters } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';
import { resetPassword, validateToken } from './data/actions';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import InvalidTokenMessage from './InvalidToken';
import ResetSuccessMessage from './ResetSuccess';
import Spinner from './Spinner';

const ResetPasswordPage = (props) => {
  const { intl } = props;
  const params = getQueryParameters();
  const mainRef = useRef();

  const [newPasswordInput, setNewPasswordValue] = useState('');
  const [confirmPasswordInput, setConfirmPasswordValue] = useState('');
  const [passwordValid, setPasswordValidValue] = useState(true);
  const [passwordMatch, setPasswordMatchValue] = useState(true);
  const [validationMessage, setvalidationMessage] = useState('');
  const [emptyFieldError, setEmptyFieldError] = useState('');

  const validatePasswordFromBackend = async (newPassword) => {
    let errorMessage;
    try {
      errorMessage = await validatePassword(newPassword);
    } catch (err) {
      errorMessage = '';
    }
    setPasswordValidValue(!errorMessage);
    setvalidationMessage(errorMessage);
  };

  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPasswordValue(newPassword);
    validatePasswordFromBackend(newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPasswordValue(confirmPassword);
    setPasswordMatchValue(confirmPassword === newPasswordInput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPasswordInput === '') {
      setEmptyFieldError(intl.formatMessage(messages['reset.password.empty.new.password.field.error']));
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMatchValue(false);
      return;
    }
    if (passwordValid && passwordMatch) {
      const formPayload = {
        new_password1: newPasswordInput,
        new_password2: confirmPasswordInput,
      };
      props.resetPassword(formPayload, props.token, params);
    }
    mainRef.current.focus();
  };

  if (props.token_status === 'pending') {
    const { token } = props.match.params;
    if (token) {
      props.validateToken(token);
      return <Spinner />;
    }
  } else if (props.token_status === 'invalid') {
    return <InvalidTokenMessage />;
  } else if (props.status === 'success') {
    return <ResetSuccessMessage />;
  } else {
    return (
      <>
        <div id="main" className="d-flex justify-content-center m-4" ref={mainRef}>
          <div className="d-flex flex-column mw-500">
            {props.status === 'failure' ? <Alert variant="danger">{props.errors}</Alert> : null}
            {emptyFieldError && (
              <Alert id="validation-errors" variant="danger">
                <Alert.Heading>{intl.formatMessage(messages['forgot.password.empty.new.password.error.heading'])}</Alert.Heading>
                <ul><li>{intl.formatMessage(messages['reset.password.empty.new.password.field.error'])}</li></ul>
              </Alert>
            )}
            <Form>
              <h3 className="mt-3">
                {intl.formatMessage(messages['reset.password.page.heading'])}
              </h3>
              <p className="mb-4">
                {intl.formatMessage(messages['reset.password.page.instructions'])}
              </p>
              <ValidationFormGroup
                for="reset-password-input"
                invalid={!passwordValid || emptyFieldError !== ''}
                invalidMessage={validationMessage || emptyFieldError}
                className="w-100"
              >
                <Form.Label htmlFor="reset-password-input" className="h6 mr-1">
                  {intl.formatMessage(messages['reset.password.page.new.field.label'])}
                </Form.Label>
                <Input
                  name="new-password1"
                  id="reset-password-input"
                  type="password"
                  placeholder=""
                  onChange={() => setEmptyFieldError('')}
                  onBlur={e => handleNewPasswordChange(e)}
                />
              </ValidationFormGroup>
              <ValidationFormGroup
                for="confirm-password-input"
                invalid={!passwordMatch}
                invalidMessage={intl.formatMessage(messages['reset.password.page.invalid.match.message'])}
                className="w-100"
              >
                <Form.Label htmlFor="confirm-password-input" className="h6 mr-1">
                  {intl.formatMessage(messages['reset.password.page.confirm.field.label'])}
                </Form.Label>
                <Input
                  name="new-password2"
                  id="confirm-password-input"
                  type="password"
                  placeholder=""
                  value={confirmPasswordInput}
                  onChange={e => handleConfirmPasswordChange(e)}
                />
              </ValidationFormGroup>
              <StatefulButton
                type="submit"
                className="btn-primary"
                state={props.status}
                labels={{
                  default: intl.formatMessage(messages['reset.password.page.submit.button']),
                }}
                icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
                onClick={e => handleSubmit(e)}
              />
            </Form>
          </div>
        </div>
      </>
    );
  }
  return null;
};

ResetPasswordPage.defaultProps = {
  status: null,
  token_status: null,
  token: null,
  match: null,
  errors: null,
};

ResetPasswordPage.propTypes = {
  intl: intlShape.isRequired,
  resetPassword: PropTypes.func.isRequired,
  validateToken: PropTypes.func.isRequired,
  token_status: PropTypes.string,
  token: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string,
    }),
  }),
  status: PropTypes.string,
  errors: PropTypes.string,
};

export default connect(
  resetPasswordResultSelector,
  {
    resetPassword,
    validateToken,
  },
)(injectIntl(ResetPasswordPage));
