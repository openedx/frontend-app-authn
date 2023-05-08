import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, StatefulButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AccountActivationMessage from './AccountActivationMessage';
import {
  backupLoginFormBegin,
  dismissPasswordResetBanner,
  loginRequest,
} from './data/actions';
import { INVALID_FORM } from './data/constants';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';
import {
  FormGroup,
  PasswordField,
  RedirectLogistration,
} from '../common-components';
import {
  DEFAULT_STATE, RESET_PAGE,
} from '../data/constants';
import {
  getActivationStatus,
  getAllPossibleQueryParams,
  setSurveyCookie,
  updatePathWithQueryParams,
} from '../data/utils';
import ResetPasswordSuccess from '../reset-password/ResetPasswordSuccess';

const LoginPage = (props) => {
  const {
    backedUpFormData,
    loginErrorCode,
    loginErrorContext,
    loginResult,
    shouldBackupState,
    showResetPasswordSuccessBanner,
    submitState,
    // Actions
    backupFormState,
  } = props;
  const { formatMessage } = useIntl();
  const activationMsgType = getActivationStatus();
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });

  useEffect(() => {
    sendPageEvent('login_and_registration', 'login');
  }, []);

  /**
   * Backup the login form in redux when login page is toggled.
   */
  useEffect(() => {
    if (shouldBackupState) {
      backupFormState({
        formFields: { ...formFields },
        errors: { ...errors },
      });
    }
  }, [shouldBackupState, formFields, errors, backupFormState]);

  useEffect(() => {
    if (loginErrorCode) {
      setErrorCode(prevState => ({ type: loginErrorCode, count: prevState.count + 1 }));
    }
  }, [loginErrorCode]);

  useEffect(() => {
    if (loginResult.success) {
      // TODO: Do we still need this cookie?
      setSurveyCookie('login');
    }
  }, [loginResult]);

  const validateFormFields = (payload) => {
    const { emailOrUsername, password } = payload;
    const fieldErrors = { ...errors };

    if (emailOrUsername === '') {
      fieldErrors.emailOrUsername = formatMessage(messages['email.validation.message']);
    } else if (emailOrUsername < 3) {
      fieldErrors.emailOrUsername = formatMessage(messages['username.or.email.format.validation.less.chars.message']);
    }
    if (password === '') {
      fieldErrors.password = formatMessage(messages['password.validation.message']);
    }

    return { ...fieldErrors };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (showResetPasswordSuccessBanner) {
      props.dismissPasswordResetBanner();
    }

    const formData = { ...formFields };
    const validationErrors = validateFormFields(formData);
    if (validationErrors.emailOrUsername || validationErrors.password) {
      setErrors({ ...validationErrors });
      setErrorCode(prevState => ({ type: INVALID_FORM, count: prevState.count + 1 }));
      return;
    }

    // add query params to the payload
    const payload = { email_or_username: formData.emailOrUsername, password: formData.password, ...queryParams };
    props.loginRequest(payload);
  };

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };
  const trackForgotPasswordLinkClick = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['login.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <RedirectLogistration
        success={loginResult.success}
        redirectUrl={loginResult.redirectUrl}
      />
      <div className="mw-xs mt-3 mb-2">
        <LoginFailureMessage
          errorCode={errorCode.type}
          failureCount={errorCode.count}
          context={loginErrorContext}
        />
        <AccountActivationMessage
          messageType={activationMsgType}
        />
        {showResetPasswordSuccessBanner && <ResetPasswordSuccess />}
        <Form id="sign-in-form" name="sign-in-form">
          <FormGroup
            name="emailOrUsername"
            value={formFields.emailOrUsername}
            autoComplete="on"
            handleChange={handleOnChange}
            handleFocus={handleOnFocus}
            errorMessage={errors.emailOrUsername}
            floatingLabel={formatMessage(messages['login.user.identity.label'])}
          />
          <PasswordField
            name="password"
            value={formFields.password}
            autoComplete="off"
            showRequirements={false}
            handleChange={handleOnChange}
            handleFocus={handleOnFocus}
            errorMessage={errors.password}
            floatingLabel={formatMessage(messages['login.password.label'])}
          />
          <StatefulButton
            name="sign-in"
            id="sign-in"
            type="submit"
            variant="brand"
            className="login-button-width"
            state={submitState}
            labels={{
              default: formatMessage(messages['sign.in.button']),
              pending: '',
            }}
            onClick={handleSubmit}
            onMouseDown={(event) => event.preventDefault()}
          />
          <Link
            id="forgot-password"
            name="forgot-password"
            className="btn btn-link font-weight-500 text-body"
            to={updatePathWithQueryParams(RESET_PAGE)}
            onClick={trackForgotPasswordLinkClick}
          >
            {formatMessage(messages['forgot.password'])}
          </Link>
        </Form>
      </div>
    </>
  );
};

const mapStateToProps = state => {
  const loginPageState = state.login;
  return {
    backedUpFormData: loginPageState.loginFormData,
    loginErrorCode: loginPageState.loginErrorCode,
    loginErrorContext: loginPageState.loginErrorContext,
    loginResult: loginPageState.loginResult,
    shouldBackupState: loginPageState.shouldBackupState,
    showResetPasswordSuccessBanner: loginPageState.showResetPasswordSuccessBanner,
    submitState: loginPageState.submitState,
  };
};

LoginPage.propTypes = {
  backedUpFormData: PropTypes.shape({
    formFields: PropTypes.shape({}),
    errors: PropTypes.shape({}),
  }),
  loginErrorCode: PropTypes.string,
  loginErrorContext: PropTypes.shape({
    email: PropTypes.string,
    redirectUrl: PropTypes.string,
    context: PropTypes.shape({}),
  }),
  loginResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  shouldBackupState: PropTypes.bool,
  showResetPasswordSuccessBanner: PropTypes.bool,
  submitState: PropTypes.string,
  // Actions
  backupFormState: PropTypes.func.isRequired,
  dismissPasswordResetBanner: PropTypes.func.isRequired,
  loginRequest: PropTypes.func.isRequired,
};

LoginPage.defaultProps = {
  backedUpFormData: {
    formFields: {
      emailOrUsername: '', password: '',
    },
    errors: {
      emailOrUsername: '', password: '',
    },
  },
  loginErrorCode: null,
  loginErrorContext: {},
  loginResult: {},
  shouldBackupState: false,
  showResetPasswordSuccessBanner: false,
  submitState: DEFAULT_STATE,
};

export default connect(
  mapStateToProps,
  {
    backupFormState: backupLoginFormBegin,
    dismissPasswordResetBanner,
    loginRequest,
  },
)(injectIntl(LoginPage));
