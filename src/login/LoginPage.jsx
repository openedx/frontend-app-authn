import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  Form, Hyperlink, Input, StatefulButton, ValidationFormGroup,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AccountActivationMessage from './AccountActivationMessage';
import ConfirmationAlert from '../common-components/ConfirmationAlert';
import { loginRequest } from './data/actions';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { loginErrorSelector, loginRequestSelector } from './data/selectors';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import LoginHelpLinks from './LoginHelpLinks';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';
import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration,
} from '../common-components';
import {
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, LOGIN_PAGE, REGISTER_PAGE, ENTERPRISE_LOGIN_URL, PENDING_STATE,
} from '../data/constants';
import { forgotPasswordResultSelector } from '../forgot-password';

class LoginPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      password: '',
      email: '',
      errors: {
        email: '',
        password: '',
      },
      emailValid: false,
      passwordValid: false,
      formValid: false,
      institutionLogin: false,
    };
  }

  componentDidMount() {
    const params = (new URL(document.location)).searchParams;
    const payload = {
      redirect_to: params.get('next') || DEFAULT_REDIRECT_URL,
    };
    this.props.getThirdPartyAuthContext(payload);
  }

  getEnterPriseLoginURL() {
    return getConfig().LMS_BASE_URL + ENTERPRISE_LOGIN_URL;
  }

  handleInstitutionLogin = () => {
    sendTrackEvent('edx.bi.institution_login_form.toggled', { category: 'user-engagement' });
    sendPageEvent('login_and_registration', 'institution_login');
    this.setState(prevState => ({ institutionLogin: !prevState.institutionLogin }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const params = (new URL(document.location)).searchParams;
    const payload = {
      email: this.state.email,
      password: this.state.password,
    };
    const next = params.get('next');
    const courseId = params.get('course_id');
    if (next) {
      payload.next = next;
    }
    if (courseId) {
      payload.course_id = courseId;
    }
    if (!this.state.formValid) {
      this.validateInput('email', payload.email);
      this.validateInput('password', payload.password);
      return;
    }

    this.props.loginRequest(payload);
  }

  validateInput(inputName, value) {
    let { emailValid, passwordValid } = this.state;
    const { errors } = this.state;

    switch (inputName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        errors.email = emailValid ? '' : null;
        break;
      case 'password':
        passwordValid = value.length > 0;
        errors.password = passwordValid ? '' : null;
        break;
      default:
        break;
    }

    this.setState({
      errors,
      emailValid,
      passwordValid,
    }, this.validateForm);
  }

  handleOnChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
    this.validateInput(e.target.name, e.target.value);
  }

  validateForm() {
    const { emailValid, passwordValid } = this.state;
    this.setState({
      formValid: emailValid && passwordValid,
    });
  }

  handleCreateAccountLinkClickEvent() {
    sendTrackEvent('edx.bi.register_form.toggled', { category: 'user-engagement' });
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    let thirdPartyComponent = null;
    if ((providers.length || secondaryProviders.length) && !currentProvider) {
      thirdPartyComponent = (
        <>
          <RenderInstitutionButton
            onSubmitHandler={this.handleInstitutionLogin}
            secondaryProviders={secondaryProviders}
            buttonTitle={intl.formatMessage(messages['institution.login.button'])}
          />
          <div className="row tpa-container">
            <SocialAuthProviders socialAuthProviders={providers} />
          </div>
        </>
      );
    } else if (thirdPartyAuthApiStatus === PENDING_STATE) {
      thirdPartyComponent = <Skeleton height={36} />;
    } return thirdPartyComponent;
  }

  render() {
    const {
      intl, submitState, thirdPartyAuthContext, thirdPartyAuthApiStatus,
    } = this.props;
    const { currentProvider, providers, secondaryProviders } = this.props.thirdPartyAuthContext;

    const params = (new URL(window.location.href)).searchParams;
    const activationMsgType = params.get('account_activation_status');

    if (this.state.institutionLogin) {
      return (
        <InstitutionLogistration
          onSubmitHandler={this.handleInstitutionLogin}
          secondaryProviders={thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['institution.login.page.title'])}
          buttonTitle={intl.formatMessage(messages['institution.login.page.back.button'])}
        />
      );
    }

    sendPageEvent('login_and_registration', 'login');
    return (
      <>
        <RedirectLogistration
          success={this.props.loginResult.success}
          redirectUrl={this.props.loginResult.redirectUrl}
          finishAuthUrl={thirdPartyAuthContext.finishAuthUrl}
        />
        <div className="d-flex justify-content-center m-4">
          <div className="d-flex flex-column">
            <div className="mw-500">
              {thirdPartyAuthContext.currentProvider
              && (
                <ThirdPartyAuthAlert
                  currentProvider={thirdPartyAuthContext.currentProvider}
                  platformName={thirdPartyAuthContext.platformName}
                />
              )}
              {this.props.loginError ? <LoginFailureMessage loginError={this.props.loginError} /> : null}
              {activationMsgType && <AccountActivationMessage messageType={activationMsgType} />}
              {this.props.forgotPassword.status === 'complete' ? <ConfirmationAlert email={this.props.forgotPassword.email} /> : null}
              <div className="d-flex flex-row">
                <p>
                  {intl.formatMessage(messages['first.time.here'])}
                  <Hyperlink className="ml-1" destination={REGISTER_PAGE} onClick={this.handleCreateAccountLinkClickEvent}>
                    {intl.formatMessage(messages['create.an.account'])}.
                  </Hyperlink>
                </p>
              </div>
              <h2 className="text-left mt-2 mb-3">
                {intl.formatMessage(messages['sign.in.heading'])}
              </h2>
              <Form className="m-0">
                <ValidationFormGroup
                  for="email"
                  invalid={this.state.errors.email !== ''}
                  invalidMessage={intl.formatMessage(messages['email.format.validation.message'])}
                  className="mb-0 w-100"
                >
                  <Form.Label htmlFor="loginEmail" className="h6 mr-1">
                    {intl.formatMessage(messages['email.label'])}
                  </Form.Label>
                  <Input
                    name="email"
                    id="loginEmail"
                    type="email"
                    placeholder="username@domain.com"
                    value={this.state.email}
                    onChange={e => this.handleOnChange(e)}
                  />
                  <p className="mb-4">{intl.formatMessage(messages['email.help.message'])}</p>
                </ValidationFormGroup>
                <ValidationFormGroup
                  for="password"
                  invalid={this.state.errors.password !== ''}
                  invalidMessage={intl.formatMessage(messages['password.validation.message'])}
                  className="mb-0 w-100"
                >
                  <Form.Label htmlFor="loginPassword" className="h6 mr-1">
                    {intl.formatMessage(messages['password.label'])}
                  </Form.Label>
                  <Input
                    name="password"
                    id="loginPassword"
                    type="password"
                    value={this.state.password}
                    onChange={e => this.handleOnChange(e)}
                  />
                </ValidationFormGroup>
                <LoginHelpLinks page={LOGIN_PAGE} />
                <Hyperlink className="field-link mt-0 mb-3" destination={this.getEnterPriseLoginURL()}>
                  {intl.formatMessage(messages['enterprise.login.link.text'])}
                </Hyperlink>
                <StatefulButton
                  type="submit"
                  className="btn-primary"
                  state={submitState}
                  labels={{
                    default: intl.formatMessage(messages['sign.in.button']),
                  }}
                  onClick={this.handleSubmit}
                />
              </Form>
              {(providers.length || secondaryProviders.length || thirdPartyAuthApiStatus === PENDING_STATE)
                && !currentProvider ? (
                  <div className="mb-4 pt-10">
                    <h4>{intl.formatMessage(messages['or.sign.in.with'])}</h4>
                  </div>
                ) : null}
              {this.renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl)}
            </div>
          </div>
        </div>
      </>
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
  },
)(injectIntl(LoginPage));
