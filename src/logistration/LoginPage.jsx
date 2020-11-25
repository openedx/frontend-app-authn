import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Input, StatefulButton, ValidationFormGroup } from '@edx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ConfirmationAlert from './ConfirmationAlert';
import { getThirdPartyAuthContext, loginRequest } from './data/actions';
import { loginRequestSelector, thirdPartyAuthContextSelector } from './data/selectors';
import InstitutionLogistration, { RenderInstitutionButton } from './InstitutionLogistration';
import LoginHelpLinks from './LoginHelpLinks';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';
import RedirectLogistration from './RedirectLogistration';
import SocialAuthProviders from './SocialAuthProviders';
import ThirdPartyAuthAlert from './ThirdPartyAuthAlert';

import { DEFAULT_REDIRECT_URL, DEFAULT_STATE, REGISTER_PAGE } from '../data/constants';
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

  handleInstitutionLogin = () => {
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
      payload.next = params.next;
    }
    if (courseId) {
      payload.course_id = params.course_id;
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

  render() {
    const { intl, submitState, thirdPartyAuthContext } = this.props;

    if (this.state.institutionLogin) {
      return (
        <InstitutionLogistration
          onSubmitHandler={this.handleInstitutionLogin}
          secondaryProviders={thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['logistration.login.institution.login.page.title'])}
          buttonTitle={intl.formatMessage(messages['logistration.login.institution.login.page.back.button'])}
        />
      );
    }
    return (
      <>
        <RedirectLogistration
          success={this.props.loginResult.success}
          redirectUrl={this.props.loginResult.redirectUrl}
          finishAuthUrl={thirdPartyAuthContext.finishAuthUrl}
        />
        <div className="d-flex justify-content-center login-container">
          <div className="d-flex flex-column" style={{ width: '400px' }}>
            {thirdPartyAuthContext.currentProvider
            && (
              <ThirdPartyAuthAlert
                currentProvider={thirdPartyAuthContext.currentProvider}
                platformName={thirdPartyAuthContext.platformName}
              />
            )}
            {this.props.loginError ? <LoginFailureMessage errors={this.props.loginError} /> : null}
            {this.props.forgotPassword.status === 'complete' ? <ConfirmationAlert email={this.props.forgotPassword.email} /> : null}
            <div className="d-flex flex-row">
              <p>
                First time here?<a className="ml-1" href={REGISTER_PAGE}>Create an Account.</a>
              </p>
            </div>
            <h2 className="font-color text-left mt-2 mb-3">
              {intl.formatMessage(messages['logistration.login.institution.login.sign.in'])}
            </h2>
            {thirdPartyAuthContext.secondaryProviders.length ? (
              <>
                <RenderInstitutionButton
                  onSubmitHandler={this.handleInstitutionLogin}
                  secondaryProviders={thirdPartyAuthContext.secondaryProviders}
                  buttonTitle={intl.formatMessage(messages['logistration.login.institution.login.button'])}
                />
                <div className="section-heading-line mb-4">
                  <h4>{intl.formatMessage(messages['logistration.login.institution.login.sign.in.with'])}</h4>
                </div>
              </>
            ) : null }
            <form className="m-0">
              <div className="form-group">
                <div className="d-flex flex-column align-items-start">
                  <ValidationFormGroup
                    for="email"
                    invalid={this.state.errors.email !== ''}
                    invalidMessage="The email address you've provided isn't formatted correctly."
                  >
                    <label htmlFor="loginEmail" className="h6 mr-1">Email</label>
                    <Input
                      name="email"
                      id="loginEmail"
                      type="email"
                      placeholder="username@domain.com"
                      value={this.state.email}
                      onChange={e => this.handleOnChange(e)}
                      style={{ width: '400px' }}
                    />
                  </ValidationFormGroup>
                </div>
                <p className="mb-4">The email address you used to register with edX.</p>
                <div className="d-flex flex-column align-items-start">
                  <ValidationFormGroup
                    for="password"
                    invalid={this.state.errors.password !== ''}
                    invalidMessage="Please enter your password."
                    className="mb-0"
                  >
                    <label htmlFor="loginPassword" className="h6 mr-1">Password</label>
                    <Input
                      name="password"
                      id="loginPassword"
                      type="password"
                      value={this.state.password}
                      onChange={e => this.handleOnChange(e)}
                      style={{ width: '400px' }}
                    />
                  </ValidationFormGroup>
                </div>
                <LoginHelpLinks page="login" />
              </div>
              <StatefulButton
                type="submit"
                className="btn-primary submit"
                state={submitState}
                labels={{
                  default: intl.formatMessage(messages['logistration.sign.in.button']),
                }}
                onClick={this.handleSubmit}
              />
            </form>
            {thirdPartyAuthContext.providers.length && !thirdPartyAuthContext.currentProvider ? (
              <>
                <div className="section-heading-line mb-4">
                  <h4>or sign in with</h4>
                </div>
                <div className="row tpa-container">
                  <SocialAuthProviders socialAuthProviders={thirdPartyAuthContext.providers} />
                </div>
              </>
            ) : null}
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
  loginError: PropTypes.string,
  loginRequest: PropTypes.func.isRequired,
  loginResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  submitState: PropTypes.string,
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
  return {
    loginError: state.logistration.loginError,
    submitState: state.logistration.submitState,
    forgotPassword,
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
