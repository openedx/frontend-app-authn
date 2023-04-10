import React from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Hyperlink, Icon, StatefulButton,
} from '@edx/paragon';
import { Institution } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import {
  FormGroup, InstitutionLogistration, PasswordField, RedirectLogistration,
  RenderInstitutionButton, SocialAuthProviders, ThirdPartyAuthAlert,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, ENTERPRISE_LOGIN_URL, PENDING_STATE, RESET_PAGE,
} from '../data/constants';
import {
  getActivationStatus,
  getAllPossibleQueryParams,
  getTpaHint,
  getTpaProvider,
  setSurveyCookie,
  updatePathWithQueryParams,
  windowScrollTo,
} from '../data/utils';
import ResetPasswordSuccess from '../reset-password/ResetPasswordSuccess';
import AccountActivationMessage from './AccountActivationMessage';
import {
  loginRemovePasswordResetBanner, loginRequest, loginRequestFailure, loginRequestReset, setLoginFormData,
} from './data/actions';
import { INVALID_FORM, TPA_AUTHENTICATION_FAILURE } from './data/constants';
import { loginErrorSelector, loginFormDataSelector, loginRequestSelector } from './data/selectors';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';

class LoginPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      password: this.props.loginFormData.password,
      emailOrUsername: this.props.loginFormData.emailOrUsername,
      errors: {
        emailOrUsername: this.props.loginFormData.errors.emailOrUsername,
        password: this.props.loginFormData.errors.password,
      },
      isSubmitted: false,
    };
    this.queryParams = getAllPossibleQueryParams();
    this.tpaHint = getTpaHint();
  }

  componentDidMount() {
    sendPageEvent('login_and_registration', 'login');
    const payload = { ...this.queryParams };

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.getThirdPartyAuthContext(payload);
    this.props.loginRequestReset();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.loginFormData && this.props.loginFormData !== nextProps.loginFormData) {
      // Ensuring browser's autofill user credentials get filled and their state persists in the redux store.
      const nextState = {
        emailOrUsername: nextProps.loginFormData.emailOrUsername || this.state.emailOrUsername,
        password: nextProps.loginFormData.password || this.state.password,
      };
      this.setState({
        ...nextProps.loginFormData,
        ...nextState,
      });
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    if (this.props.resetPassword) {
      this.props.loginRemovePasswordResetBanner();
    }
  }

  getEnterPriseLoginURL() {
    return getConfig().LMS_BASE_URL + ENTERPRISE_LOGIN_URL;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.props.resetPassword) {
      this.props.loginRemovePasswordResetBanner();
    }
    this.setState({ isSubmitted: true });
    const { emailOrUsername, password } = this.state;
    const emailValidationError = this.validateEmail(emailOrUsername);
    const passwordValidationError = this.validatePassword(password);

    if (emailValidationError !== '' || passwordValidationError !== '') {
      this.props.setLoginFormData({
        errors: {
          emailOrUsername: emailValidationError,
          password: passwordValidationError,
        },
      });
      this.props.loginRequestFailure({
        errorCode: INVALID_FORM,
      });
      return;
    }

    const payload = {
      email_or_username: emailOrUsername, password, ...this.queryParams,
    };
    this.props.loginRequest(payload);
  };

  handleOnFocus = (e) => {
    const { errors } = this.state;
    errors[e.target.name] = '';
    this.props.setLoginFormData({
      errors,
    });
  };

  handleOnBlur = (e) => {
    const payload = {
      [e.target.name]: e.target.value,
    };
    this.props.setLoginFormData(payload);
  };

  handleForgotPasswordLinkClickEvent = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  validateEmail(email) {
    const { errors } = this.state;

    if (email === '') {
      errors.emailOrUsername = this.props.intl.formatMessage(messages['email.validation.message']);
    } else if (email.length < 3) {
      errors.emailOrUsername = this.props.intl.formatMessage(messages['username.or.email.format.validation.less.chars.message']);
    } else {
      errors.emailOrUsername = '';
    }
    return errors.emailOrUsername;
  }

  validatePassword(password) {
    const { errors } = this.state;
    errors.password = password.length > 0 ? '' : this.props.intl.formatMessage(messages['password.validation.message']);

    return errors.password;
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
    const isSocialAuthActive = !!providers.length && !currentProvider;
    const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;

    return (
      <>
        {(isSocialAuthActive || (isEnterpriseLoginDisabled && isInstitutionAuthActive))
          && (
            <div className="mt-4 mb-3 h4">
              {intl.formatMessage(messages['login.other.options.heading'])}
            </div>
          )}

        {(!isEnterpriseLoginDisabled && isSocialAuthActive) && (
          <Hyperlink className="btn btn-link btn-sm text-body p-0 mb-4" destination={this.getEnterPriseLoginURL()}>
            <Icon src={Institution} className="institute-icon" />
            {intl.formatMessage(messages['enterprise.login.btn.text'])}
          </Hyperlink>
        )}

        {thirdPartyAuthApiStatus === PENDING_STATE ? (
          <Skeleton className="tpa-skeleton mb-3" height={30} count={2} />
        ) : (
          <>
            {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
              <RenderInstitutionButton
                onSubmitHandler={this.props.handleInstitutionLogin}
                buttonTitle={intl.formatMessage(messages['institution.login.button'])}
              />
            )}
            {isSocialAuthActive && (
              <div className="row m-0">
                <SocialAuthProviders socialAuthProviders={providers} />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  renderForm(
    currentProvider,
    providers,
    secondaryProviders,
    thirdPartyAuthContext,
    thirdPartyAuthApiStatus,
    submitState,
    intl,
  ) {
    const activationMsgType = getActivationStatus();
    if (this.props.institutionLogin) {
      return (
        <InstitutionLogistration
          secondaryProviders={thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['institution.login.page.title'])}
        />
      );
    }
    const tpaAuthenticationError = {};
    if (thirdPartyAuthContext.errorMessage) {
      tpaAuthenticationError.context = {
        errorMessage: thirdPartyAuthContext.errorMessage,
      };
      tpaAuthenticationError.errorCode = TPA_AUTHENTICATION_FAILURE;
    }
    if (this.props.loginResult.success) {
      setSurveyCookie('login');

      // Fire optimizely events
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-login-coversion',
      });
    }

    return (
      <>
        <Helmet>
          <title>{intl.formatMessage(messages['login.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        <RedirectLogistration
          success={this.props.loginResult.success}
          redirectUrl={this.props.loginResult.redirectUrl}
          finishAuthUrl={thirdPartyAuthContext.finishAuthUrl}
        />
        <div className="mw-xs mt-3">
          <ThirdPartyAuthAlert
            currentProvider={thirdPartyAuthContext.currentProvider}
            platformName={thirdPartyAuthContext.platformName}
          />
          {this.props.loginError ? <LoginFailureMessage loginError={this.props.loginError} /> : null}
          {thirdPartyAuthContext.errorMessage ? <LoginFailureMessage loginError={tpaAuthenticationError} /> : null}
          {submitState === DEFAULT_STATE && this.state.isSubmitted ? windowScrollTo({ left: 0, top: 0, behavior: 'smooth' }) : null}
          {activationMsgType && <AccountActivationMessage messageType={activationMsgType} />}
          {this.props.resetPassword && !this.props.loginError ? <ResetPasswordSuccess /> : null}
          <Form name="sign-in-form" id="sign-in-form">
            <FormGroup
              name="emailOrUsername"
              value={this.state.emailOrUsername}
              autoComplete="on"
              handleChange={(e) => this.setState({ emailOrUsername: e.target.value, isSubmitted: false })}
              handleFocus={this.handleOnFocus}
              handleBlur={this.handleOnBlur}
              errorMessage={this.state.errors.emailOrUsername}
              floatingLabel={intl.formatMessage(messages['login.user.identity.label'])}
            />
            <PasswordField
              name="password"
              value={this.state.password}
              autoComplete="off"
              showRequirements={false}
              handleChange={(e) => this.setState({ password: e.target.value, isSubmitted: false })}
              handleFocus={this.handleOnFocus}
              handleBlur={this.handleOnBlur}
              errorMessage={this.state.errors.password}
              floatingLabel={intl.formatMessage(messages['login.password.label'])}
            />
            <StatefulButton
              name="sign-in"
              id="sign-in"
              type="submit"
              variant="brand"
              className="login-button-width"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['sign.in.button']),
                pending: '',
              }}
              onClick={this.handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            <Link
              id="forgot-password"
              name="forgot-password"
              className="btn btn-link font-weight-500 text-body"
              to={updatePathWithQueryParams(RESET_PAGE)}
              onClick={this.handleForgotPasswordLinkClickEvent}
            >
              {intl.formatMessage(messages['forgot.password'])}
            </Link>
            {this.renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl)}
          </Form>
        </div>
      </>
    );
  }

  render() {
    const {
      intl, submitState, thirdPartyAuthContext, thirdPartyAuthApiStatus,
    } = this.props;
    const { currentProvider, providers, secondaryProviders } = this.props.thirdPartyAuthContext;

    if (this.tpaHint) {
      if (thirdPartyAuthApiStatus === PENDING_STATE) {
        return <Skeleton height={36} />;
      }
      const { provider, skipHintedLogin } = getTpaProvider(this.tpaHint, providers, secondaryProviders);
      if (skipHintedLogin) {
        window.location.href = getConfig().LMS_BASE_URL + provider.loginUrl;
        return null;
      }
      return provider ? (<EnterpriseSSO provider={provider} intl={intl} />) : this.renderForm(
        currentProvider,
        providers,
        secondaryProviders,
        thirdPartyAuthContext,
        thirdPartyAuthApiStatus,
        submitState,
        intl,
      );
    }
    return this.renderForm(
      currentProvider,
      providers,
      secondaryProviders,
      thirdPartyAuthContext,
      thirdPartyAuthApiStatus,
      submitState,
      intl,
    );
  }
}

LoginPage.defaultProps = {
  loginResult: null,
  loginError: null,
  loginFormData: {
    emailOrUsername: '',
    password: '',
    errors: {
      emailOrUsername: '',
      password: '',
    },
  },
  resetPassword: false,
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: 'pending',
  thirdPartyAuthContext: {
    currentProvider: null,
    errorMessage: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
  },
};

LoginPage.propTypes = {
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func,
  }).isRequired,
  loginError: PropTypes.shape({}),
  loginRequest: PropTypes.func.isRequired,
  loginRequestFailure: PropTypes.func.isRequired,
  loginRequestReset: PropTypes.func.isRequired,
  setLoginFormData: PropTypes.func.isRequired,
  loginRemovePasswordResetBanner: PropTypes.func.isRequired,
  loginResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  loginFormData: PropTypes.shape({
    emailOrUsername: PropTypes.string,
    password: PropTypes.string,
    errors: PropTypes.shape({
      emailOrUsername: PropTypes.string,
      password: PropTypes.string,
    }),
  }),
  resetPassword: PropTypes.bool,
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
    errorMessage: PropTypes.string,
    platformName: PropTypes.string,
    providers: PropTypes.arrayOf(PropTypes.shape({})),
    secondaryProviders: PropTypes.arrayOf(PropTypes.shape({})),
    finishAuthUrl: PropTypes.string,
  }),
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const loginResult = loginRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  const loginError = loginErrorSelector(state);
  const loginFormData = loginFormDataSelector(state);
  return {
    submitState: state.login.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    loginError,
    loginResult,
    thirdPartyAuthContext,
    loginFormData,
    resetPassword: state.login.resetPassword,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    loginRequest,
    loginRequestFailure,
    loginRequestReset,
    setLoginFormData,
    loginRemovePasswordResetBanner,
  },
)(injectIntl(LoginPage));
