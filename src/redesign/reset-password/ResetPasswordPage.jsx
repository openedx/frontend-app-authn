import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { Form, Spinner, StatefulButton } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getQueryParameters, getConfig } from '@edx/frontend-platform';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import messages from './messages';
import { resetPassword, validateToken } from './data/actions';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import ResetPasswordFailure from './ResetPasswordFailure';
import { PasswordField } from '../common-components';
import {
  LETTER_REGEX, LOGIN_PAGE, NUMBER_REGEX, RESET_PAGE,
} from '../data/constants';
import {
  FORM_SUBMISSION_ERROR, PASSWORD_RESET_ERROR, PASSWORD_VALIDATION_ERROR, TOKEN_STATE,
} from './data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';

const ResetPasswordPage = (props) => {
  const { intl } = props;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [errorCode, setErrorCode] = useState(null);

  useEffect(() => {
    if (props.status !== TOKEN_STATE.PENDING && props.status !== PASSWORD_RESET_ERROR) {
      setErrorCode(props.status);
    }
    if (props.status === PASSWORD_VALIDATION_ERROR) {
      formErrors.newPassword = intl.formatMessage(messages['password.validation.message']);
      setFormErrors({ ...formErrors });
    }
  }, [props.errorMsg]);

  const validatePasswordFromBackend = async (password) => {
    let errorMessage = '';
    try {
      errorMessage = await validatePassword(password);
    } catch (err) {
      errorMessage = '';
    }
    setFormErrors({ ...formErrors, newPassword: errorMessage });
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'newPassword':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          formErrors.newPassword = intl.formatMessage(messages['password.validation.message']);
        } else {
          validatePasswordFromBackend(value);
        }
        break;
      case 'confirmPassword':
        if (!value) {
          formErrors.confirmPassword = intl.formatMessage(messages['confirm.your.password']);
        } else if (value !== newPassword) {
          formErrors.confirmPassword = intl.formatMessage(messages['passwords.do.not.match']);
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

  if (props.status === TOKEN_STATE.PENDING) {
    const { token } = props.match.params;
    if (token) {
      props.validateToken(token);
      return <Spinner animation="border" variant="primary" className="mt-5" />;
    }
  } else if (props.status === PASSWORD_RESET_ERROR) {
    return <Redirect to={RESET_PAGE} />;
  } else if (props.status === 'success') {
    return <Redirect to={LOGIN_PAGE} />;
  } else {
    return (
      <div>
        <Helmet>
          <title>{intl.formatMessage(messages['reset.password.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        <span className="nav nav-tabs">
          <Link className="nav-item nav-link" to={updatePathWithQueryParams(LOGIN_PAGE)}>
            <FontAwesomeIcon className="mr-2" icon={faChevronLeft} /> {intl.formatMessage(messages['sign.in'])}
          </Link>
        </span>
        <div id="main-content" className="main-content">
          <div className="mw-xs">
            <ResetPasswordFailure errorCode={errorCode} errorMsg={props.errorMsg} />
            <h4>{intl.formatMessage(messages['reset.password'])}</h4>
            <p className="mb-4">{intl.formatMessage(messages['reset.password.page.instructions'])}</p>
            <Form>
              <PasswordField
                name="newPassword"
                value={newPassword}
                handleChange={(e) => setNewPassword(e.target.value)}
                handleBlur={(e) => validateInput(e.target.name, e.target.value)}
                handleFocus={handleOnFocus}
                errorMessage={formErrors.newPassword}
                floatingLabel={intl.formatMessage(messages['new.password.label'])}
              />
              <PasswordField
                name="confirmPassword"
                value={confirmPassword}
                handleChange={handleConfirmPasswordChange}
                handleFocus={handleOnFocus}
                errorMessage={formErrors.confirmPassword}
                showRequirements={false}
                floatingLabel={intl.formatMessage(messages['confirm.password.label'])}
              />
              <StatefulButton
                type="submit"
                variant="brand"
                className="stateful-button-width"
                state={props.status}
                labels={{
                  default: intl.formatMessage(messages['reset.password']),
                  pending: '',
                }}
                onClick={e => handleSubmit(e)}
                onMouseDown={(e) => e.preventDefault()}
              />
            </Form>
          </div>
        </div>
      </div>
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
  errorMsg: PropTypes.string,
};

export default connect(
  resetPasswordResultSelector,
  {
    resetPassword,
    validateToken,
  },
)(injectIntl(ResetPasswordPage));
