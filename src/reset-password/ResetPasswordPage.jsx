import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import {
  Alert, Form, StatefulButton,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getQueryParameters, getConfig } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';
import { resetPassword, validateToken } from './data/actions';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import InvalidTokenMessage from './InvalidToken';
import ResetSuccessMessage from './ResetSuccess';
import {
  AuthnValidationFormGroup,
  APIFailureMessage,
} from '../common-components';
import Spinner from './Spinner';
import { API_RATELIMIT_ERROR, INTERNAL_SERVER_ERROR } from '../data/constants';

const ResetPasswordPage = (props) => {
  const { intl } = props;
  const params = getQueryParameters();

  const [newPasswordInput, setNewPasswordValue] = useState('');
  const [confirmPasswordInput, setConfirmPasswordValue] = useState('');
  const [passwordValid, setPasswordValidValue] = useState(true);
  const [passwordMatch, setPasswordMatchValue] = useState(true);
  const [validationMessage, setvalidationMessage] = useState('');
  const [bannerErrorMessage, setbannerErrorMessage] = useState('');

  useEffect(() => {
    if (props.status === 'failure'
      && props.errors !== INTERNAL_SERVER_ERROR
      && props.errors !== API_RATELIMIT_ERROR) {
      setbannerErrorMessage(props.errors);
      setvalidationMessage(props.errors);
      setPasswordValidValue(false);
    }
  }, [props.status]);

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
  };

  const handleNewPasswordOnBlur = (e) => {
    const newPassword = e.target.value;
    setNewPasswordValue(newPassword);

    if (newPassword === '') {
      setPasswordValidValue(false);
      setvalidationMessage(intl.formatMessage(messages['reset.password.empty.new.password.field.error']));
    } else {
      validatePasswordFromBackend(newPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPasswordValue(confirmPassword);
    setPasswordMatchValue(confirmPassword === newPasswordInput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    if (newPasswordInput === '') {
      setPasswordValidValue(false);
      setvalidationMessage(intl.formatMessage(messages['reset.password.empty.new.password.field.error']));
      setbannerErrorMessage(intl.formatMessage(messages['reset.password.empty.new.password.field.error']));
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMatchValue(false);
      return;
    }

    const formPayload = {
      new_password1: newPasswordInput,
      new_password2: confirmPasswordInput,
    };
    props.resetPassword(formPayload, props.token, params);
  };

  if (props.status === 'token-pending') {
    const { token } = props.match.params;
    if (token) {
      props.validateToken(token);
      return <Spinner />;
    }
  } else if (props.status === 'invalid' && props.errors === INTERNAL_SERVER_ERROR) {
    return (
      <APIFailureMessage header={intl.formatMessage(messages['reset.password.token.validation.sever.error'])} errorCode={INTERNAL_SERVER_ERROR} />
    );
  } else if (props.status === 'invalid' && props.errors === API_RATELIMIT_ERROR) {
    return (
      <APIFailureMessage header={intl.formatMessage(messages['reset.server.ratelimit.error'])} errorCode={API_RATELIMIT_ERROR} />
    );
  } else if (props.status === 'invalid') {
    return <InvalidTokenMessage />;
  } else if (props.status === 'success') {
    return <ResetSuccessMessage />;
  } else {
    return (
      <>
        <Helmet>
          <title>{intl.formatMessage(messages['reset.password.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        {props.status === 'failure' && props.errors === INTERNAL_SERVER_ERROR ? (
          <APIFailureMessage header={intl.formatMessage(messages['reset.password.request.server.error'])} errorCode={INTERNAL_SERVER_ERROR} />
        ) : null}
        {props.status === 'failure' && props.errors === API_RATELIMIT_ERROR ? (
          <APIFailureMessage header={intl.formatMessage(messages['reset.server.ratelimit.error'])} errorCode={API_RATELIMIT_ERROR} />
        ) : null}
        <div id="main" className="d-flex justify-content-center m-4">
          <div className="d-flex flex-column mw-500">
            {bannerErrorMessage ? (
              <Alert id="validation-errors" variant="danger">
                <Alert.Heading>{intl.formatMessage(messages['forgot.password.empty.new.password.error.heading'])}</Alert.Heading>
                <ul><li>{bannerErrorMessage}</li></ul>
              </Alert>
            ) : null}
            <Form>
              <h1 className="mt-3 h3">
                {intl.formatMessage(messages['reset.password.page.heading'])}
              </h1>
              <p className="mb-4">
                {intl.formatMessage(messages['reset.password.page.instructions'])}
              </p>
              <AuthnValidationFormGroup
                label={intl.formatMessage(messages['reset.password.page.new.field.label'])}
                for="reset-password-input"
                name="new-password1"
                type="password"
                invalid={!passwordValid}
                ariaInvalid={!passwordValid}
                invalidMessage={validationMessage}
                value={newPasswordInput}
                onChange={e => handleNewPasswordChange(e)}
                onBlur={e => handleNewPasswordOnBlur(e)}
                className="w-100"
                inputFieldStyle="border-gray-600"
              />
              <AuthnValidationFormGroup
                label={intl.formatMessage(messages['reset.password.page.confirm.field.label'])}
                for="confirm-password-input"
                name="new-password2"
                type="password"
                invalid={!passwordMatch}
                ariaInvalid={!passwordMatch}
                invalidMessage={intl.formatMessage(messages['reset.password.page.invalid.match.message'])}
                value={confirmPasswordInput}
                onChange={e => handleConfirmPasswordChange(e)}
                className="w-100"
                inputFieldStyle="border-gray-600"
              />
              <StatefulButton
                type="submit"
                className="btn-primary"
                state={props.status}
                labels={{
                  default: intl.formatMessage(messages['reset.password.page.submit.button']),
                }}
                icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
                onClick={e => handleSubmit(e)}
                onMouseDown={(e) => e.preventDefault()}
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
  token: null,
  match: null,
  errors: null,
};

ResetPasswordPage.propTypes = {
  intl: intlShape.isRequired,
  resetPassword: PropTypes.func.isRequired,
  validateToken: PropTypes.func.isRequired,
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
