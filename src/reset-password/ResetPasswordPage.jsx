import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input, StatefulButton, ValidationFormGroup } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { getQueryParameters } from '@edx/frontend-platform';
import messages from './messages';
import { resetPassword, validateToken } from './data/actions';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import InvalidTokenMessage from './InvalidToken';
import ResetSuccessMessage from './ResetSuccess';
import ResetFailureMessage from './ResetFailure';
import Spinner from './Spinner';


const ResetPasswordPage = (props) => {
  const { intl } = props;
  const params = getQueryParameters();

  const [newPasswordInput, setNewPasswordValue] = useState('');
  const [confirmPasswordInput, setConfirmPasswordValue] = useState('');
  const [passwordValid, setPasswordValidValue] = useState(true);
  const [passwordMatch, setPasswordMatchValue] = useState(true);
  const [validationMessage, setvalidationMessage] = useState('');

  const validatePasswordFromBackend = async (newPassword) => {
    const errorMessage = await validatePassword(newPassword);
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
      setPasswordValidValue(false);
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
  };

  if (props.token_status === 'pending') {
    const { token } = props.match.params;
    if (token) {
      props.validateToken(token);
      return <Spinner text="Token validation in progress .. " />;
    }
  } else if (props.token_status === 'invalid') {
    return (<InvalidTokenMessage />);
  } else if (props.status === 'success') {
    return (<ResetSuccessMessage />);
  } else {
    return (
      <>
        {props.status === 'failure' ? <ResetFailureMessage errors={props.errors} /> : null}
        <div className="d-flex justify-content-center reset-password-container">
          <div className="d-flex flex-column" style={{ width: '450px' }}>
            <form className="m-4">
              <div className="form-group">
                <h3 className="text-center mt-3">
                  {intl.formatMessage(messages['logistration.reset.password.page.heading'])}
                </h3>
                <p className="mb-4">
                  {intl.formatMessage(messages['logistration.reset.password.page.instructions'])}
                </p>
                <div className="d-flex flex-column align-items-start">
                  <ValidationFormGroup
                    for="reset-password-input"
                    invalid={!passwordValid}
                    invalidMessage={validationMessage}
                  >
                    <label htmlFor="reset-password-input" className="h6 mr-1">
                      {intl.formatMessage(messages['logistration.reset.password.page.new.field.label'])}
                    </label>
                    <Input
                      name="new-password1"
                      id="reset-password-input"
                      type="password"
                      placeholder=""
                      onBlur={e => handleNewPasswordChange(e)}
                      style={{ width: '400px' }}
                    />
                  </ValidationFormGroup>
                  <ValidationFormGroup
                    for="confirm-password-input"
                    invalid={!passwordMatch}
                    invalidMessage={intl.formatMessage(messages['logistration.reset.password.page.invalid.match.message'])}
                  >
                    <label htmlFor="confirm-password-input" className="h6 mr-1">
                      {intl.formatMessage(messages['logistration.reset.password.page.confirm.field.label'])}
                    </label>
                    <Input
                      name="new-password2"
                      id="confirm-password-input"
                      type="password"
                      placeholder=""
                      value={confirmPasswordInput}
                      onChange={e => handleConfirmPasswordChange(e)}
                      style={{ width: '400px' }}
                    />
                  </ValidationFormGroup>
                </div>
              </div>
              <StatefulButton
                type="submit"
                className="btn-primary submit"
                state={props.status}
                labels={{
                  default: intl.formatMessage(messages['logistration.reset.password.page.submit.button']),
                }}
                onClick={e => handleSubmit(e)}
              />
            </form>
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
