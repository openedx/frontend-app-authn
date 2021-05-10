import React from 'react';

import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form, Hyperlink, Icon, StatefulButton,
} from '@edx/paragon';
import { Institution } from '@edx/paragon/icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import AccountActivationMessage from './AccountActivationMessage';
import { loginRequest, loginRequestFailure, loginRequestReset } from './data/actions';
import { EDX_SITE_NAME, INVALID_FORM } from './data/constants';
import { loginErrorSelector, loginRequestSelector } from './data/selectors';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';

import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration, FormGroup, PasswordField,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, ENTERPRISE_LOGIN_URL, PENDING_STATE, RESET_PAGE,
} from '../data/constants';
import {
  getTpaProvider, getTpaHint, getAllPossibleQueryParam, getActivationStatus,
} from '../data/utils';
import { forgotPasswordResultSelector } from '../forgot-password';

class LoginPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    sendPageEvent('login_and_registration', 'login');
    this.state = {
      password: '',
      emailOrUsername: '',
      errors: {
        emailOrUsername: '',
        password: '',
      },
      isSubmitted: false,
    };
    this.queryParams = getAllPossibleQueryParam();
    this.tpaHint = getTpaHint();
  }

  componentDidMount() {
    const payload = { ...this.queryParams };

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.getThirdPartyAuthContext(payload);
    this.props.loginRequestReset();
  }

  getEnterPriseLoginURL() {
    return getConfig().LMS_BASE_URL + ENTERPRISE_LOGIN_URL;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ isSubmitted: true });

    const { emailOrUsername, password } = this.state;
    const emailValidationError = this.validateEmail(emailOrUsername);
    const passwordValidationError = this.validatePassword(password);

    if (emailValidationError !== '' || passwordValidationError !== '') {
      this.props.loginRequestFailure({
        errorCode: INVALID_FORM,
      });
      return;
    }

    const payload = {
      email: emailOrUsername, password, ...this.queryParams,
    };
    this.props.loginRequest(payload);
  }

  validateEmail(email) {
    const { errors } = this.state;
    const regex = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i, 'i');

    if (email === '') {
      errors.emailOrUsername = this.props.intl.formatMessage(messages['email.validation.message']);
    } else if (email.length < 3) {
      errors.emailOrUsername = this.props.intl.formatMessage(messages['email.format.validation.less.chars.message']);
    } else if (!regex.test(email)) {
      errors.emailOrUsername = this.props.intl.formatMessage(messages['email.format.validation.message']);
    } else {
      errors.emailOrUsername = '';
    }
    this.setState({ errors });
    return errors.emailOrUsername;
  }

  validatePassword(password) {
    const { errors } = this.state;
    errors.password = password.length > 0 ? '' : this.props.intl.formatMessage(messages['password.validation.message']);

    this.setState({ errors });
    return errors.password;
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    let thirdPartyComponent = null;
    if ((providers.length || secondaryProviders.length) && !currentProvider) {
      thirdPartyComponent = (
        <>
          <RenderInstitutionButton
            onSubmitHandler={this.props.handleInstitutionLogin}
            buttonTitle={intl.formatMessage(messages['institution.login.button'])}
          />
          <div className="row m-0">
            <SocialAuthProviders socialAuthProviders={providers} />
          </div>
        </>
      );
    } else if (thirdPartyAuthApiStatus === PENDING_STATE) {
      thirdPartyComponent = <Skeleton className="tpa-skeleton mb-3" height={30} count={2} />;
    } return thirdPartyComponent;
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
          {thirdPartyAuthContext.currentProvider
          && (
            <ThirdPartyAuthAlert
              currentProvider={thirdPartyAuthContext.currentProvider}
              platformName={thirdPartyAuthContext.platformName}
            />
          )}
          {this.props.loginError ? <LoginFailureMessage loginError={this.props.loginError} /> : null}
          {submitState === DEFAULT_STATE && this.state.isSubmitted ? window.scrollTo({ left: 0, top: 0, behavior: 'smooth' }) : null}
          {activationMsgType && <AccountActivationMessage messageType={activationMsgType} />}
          <Form className="test">
            <FormGroup
              name="email"
              value={this.state.emailOrUsername}
              handleChange={(e) => this.setState({ emailOrUsername: e.target.value, isSubmitted: false })}
              errorMessage={this.state.errors.emailOrUsername}
              floatingLabel={intl.formatMessage(messages['login.user.identity.label'])}
            />
            <PasswordField
              name="password"
              value={this.state.password}
              showRequirements={false}
              handleChange={(e) => this.setState({ password: e.target.value, isSubmitted: false })}
              errorMessage={this.state.errors.password}
              floatingLabel={intl.formatMessage(messages['login.password.label'])}
            />
            <StatefulButton
              type="submit"
              variant="brand"
              className="login-button-width"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['sign.in.button']),
                pending: '',
              }}
              icons={{
                pending: <FontAwesomeIcon title={intl.formatMessage(messages['sign.in.btn.pending.state'])} icon={faSpinner} spin />,
              }}
              onClick={this.handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            <Link id="forgot-password" className="btn btn-link font-weight-500 text-body" to={RESET_PAGE}>
              {intl.formatMessage(messages['forgot.password'])}
            </Link>
            <div className="mt-4 mb-3 h4">
              {intl.formatMessage(messages['login.other.options.heading'])}
            </div>
            { getConfig().SITE_NAME === EDX_SITE_NAME
              ? (
                <Hyperlink className="btn btn-link btn-sm text-body p-0 mb-4" destination={this.getEnterPriseLoginURL()}>
                  <Icon src={Institution} className="institute-icon" />
                  {intl.formatMessage(messages['enterprise.login.btn.text'])}
                </Hyperlink>
              )
              : this.renderThirdPartyAuth(
                providers,
                secondaryProviders,
                currentProvider,
                thirdPartyAuthApiStatus,
                intl,
              )}
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
      const { provider, isSecondaryProvider } = getTpaProvider(this.tpaHint, providers, secondaryProviders);
      if (isSecondaryProvider) {
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
  forgotPassword: null,
  loginResult: null,
  loginError: null,
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: 'pending',
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
  },
};

LoginPage.propTypes = {
  forgotPassword: PropTypes.shape({
    email: PropTypes.string,
    status: PropTypes.string,
  }),
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  loginError: PropTypes.objectOf(PropTypes.any),
  loginRequest: PropTypes.func.isRequired,
  loginRequestFailure: PropTypes.func.isRequired,
  loginRequestReset: PropTypes.func.isRequired,
  loginResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
    platformName: PropTypes.string,
    providers: PropTypes.array,
    secondaryProviders: PropTypes.array,
    finishAuthUrl: PropTypes.string,
  }),
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const forgotPassword = forgotPasswordResultSelector(state);
  const loginResult = loginRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  const loginError = loginErrorSelector(state);
  return {
    submitState: state.login.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    forgotPassword,
    loginError,
    loginResult,
    thirdPartyAuthContext,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    loginRequest,
    loginRequestFailure,
    loginRequestReset,
  },
)(injectIntl(LoginPage));
