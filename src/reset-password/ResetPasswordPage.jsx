import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, getQueryParameters } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Icon,
  Spinner,
  StatefulButton,
  Tab,
  Tabs,
} from '@edx/paragon';
import { ChevronLeft } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import BaseComponent from '../base-component';
import { PasswordField } from '../common-components';
import {
  LETTER_REGEX, LOGIN_PAGE, NUMBER_REGEX, RESET_PAGE,
} from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';
import { resetPassword, validateToken } from './data/actions';
import {
  FORM_SUBMISSION_ERROR, PASSWORD_RESET_ERROR, PASSWORD_VALIDATION_ERROR, TOKEN_STATE,
} from './data/constants';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import messages from './messages';
import ResetPasswordFailure from './ResetPasswordFailure';

const ResetPasswordPage = (props) => {
  const { formatMessage } = useIntl();
  const newPasswordError = formatMessage(messages['password.validation.message']);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const [key, setKey] = useState('');

  useEffect(() => {
    if (props.status !== TOKEN_STATE.PENDING && props.status !== PASSWORD_RESET_ERROR) {
      setErrorCode(props.status);
    }
    if (props.status === PASSWORD_VALIDATION_ERROR) {
      setFormErrors({ newPassword: newPasswordError });
    }
  }, [props.status, newPasswordError]);

  const validatePasswordFromBackend = async (password) => {
    let errorMessage = '';
    try {
      const payload = {
        reset_password_page: true,
        password,
      };
      errorMessage = await validatePassword(payload);
    } catch (err) {
      errorMessage = '';
    }
    setFormErrors({ ...formErrors, newPassword: errorMessage });
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'newPassword':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          formErrors.newPassword = formatMessage(messages['password.validation.message']);
        } else {
          validatePasswordFromBackend(value);
        }
        break;
      case 'confirmPassword':
        if (!value) {
          formErrors.confirmPassword = formatMessage(messages['confirm.your.password']);
        } else if (value !== newPassword) {
          formErrors.confirmPassword = formatMessage(messages['passwords.do.not.match']);
        } else {
          formErrors.confirmPassword = '';
        }
        break;
      default:
        break;
    }
    setFormErrors({ ...formErrors });
    return !Object.values(formErrors).some(x => (x !== ''));
  };

  const handleOnBlur = (event) => {
    let { name, value } = event.target;

    // Do not validate when focus out from 'newPassword' and focus on 'passwordValidation' icon
    // for better user experience.
    if (event.relatedTarget
      && event.relatedTarget.name === 'password'
      && name === 'newPassword'
    ) {
      return;
    }
    if (name === 'password') {
      name = 'newPassword';
      value = newPassword;
    }
    validateInput(name, value);
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;

    setConfirmPassword(value);
    validateInput('confirmPassword', value);
  };

  const handleOnFocus = (e) => {
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPasswordValid = validateInput('newPassword', newPassword);
    const isPasswordConfirmed = validateInput('confirmPassword', confirmPassword);

    if (isPasswordValid && isPasswordConfirmed) {
      const formPayload = {
        new_password1: newPassword,
        new_password2: confirmPassword,
      };
      const params = getQueryParameters();
      props.resetPassword(formPayload, props.token, params);
    } else {
      setErrorCode(FORM_SUBMISSION_ERROR);
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  const tabTitle = (
    <div className="d-inline-flex flex-wrap align-items-center">
      <Icon src={ChevronLeft} />
      <span className="ml-2">{formatMessage(messages['sign.in'])}</span>
    </div>
  );

  if (props.status === TOKEN_STATE.PENDING) {
    const { token } = props.match.params;
    if (token) {
      props.validateToken(token);
      return <Spinner animation="border" variant="primary" className="centered-align-spinner" />;
    }
  } else if (props.status === PASSWORD_RESET_ERROR) {
    return <Redirect to={updatePathWithQueryParams(RESET_PAGE)} />;
  } else if (props.status === 'success') {
    return <Redirect to={updatePathWithQueryParams(LOGIN_PAGE)} />;
  } else {
    return (
      <BaseComponent>
        <div>
          <Helmet>
            <title>{formatMessage(messages['reset.password.page.title'],
              { siteName: getConfig().SITE_NAME })}
            </title>
          </Helmet>
          <Tabs activeKey="" id="controlled-tab" onSelect={(k) => setKey(k)}>
            <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
          </Tabs>
          { key && (
            <Redirect to={updatePathWithQueryParams(key)} />
          )}
          <div id="main-content" className="main-content">
            <div className="mw-xs">
              <ResetPasswordFailure errorCode={errorCode} errorMsg={props.errorMsg} />
              <h4>{formatMessage(messages['reset.password'])}</h4>
              <p className="mb-4">{formatMessage(messages['reset.password.page.instructions'])}</p>
              <Form id="set-reset-password-form" name="set-reset-password-form">
                <PasswordField
                  name="newPassword"
                  value={newPassword}
                  handleChange={(e) => setNewPassword(e.target.value)}
                  handleBlur={handleOnBlur}
                  handleFocus={handleOnFocus}
                  errorMessage={formErrors.newPassword}
                  floatingLabel={formatMessage(messages['new.password.label'])}
                />
                <PasswordField
                  name="confirmPassword"
                  value={confirmPassword}
                  handleChange={handleConfirmPasswordChange}
                  handleFocus={handleOnFocus}
                  errorMessage={formErrors.confirmPassword}
                  showRequirements={false}
                  floatingLabel={formatMessage(messages['confirm.password.label'])}
                />
                <StatefulButton
                  id="submit-new-password"
                  name="submit-new-password"
                  type="submit"
                  variant="brand"
                  className="stateful-button-width"
                  state={props.status}
                  labels={{
                    default: formatMessage(messages['reset.password']),
                    pending: '',
                  }}
                  onClick={e => handleSubmit(e)}
                  onMouseDown={(e) => e.preventDefault()}
                />
              </Form>
            </div>
          </div>
        </div>
      </BaseComponent>
    );
  }
  return null;
};

ResetPasswordPage.defaultProps = {
  status: null,
  token: null,
  match: null,
  errorMsg: null,
};

ResetPasswordPage.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  validateToken: PropTypes.func.isRequired,
  token: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string,
    }),
  }),
  status: PropTypes.string,
  errorMsg: PropTypes.string,
};

export default connect(
  resetPasswordResultSelector,
  {
    resetPassword,
    validateToken,
  },
)(ResetPasswordPage);
