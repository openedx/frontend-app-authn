import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Input, StatefulButton, ValidationFormGroup } from '@edx/paragon';
import {
  getLocale, getCountryList, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import { getThirdPartyAuthContext, registerNewUser } from './data/actions';
import { registrationRequestSelector, thirdPartyAuthContextSelector } from './data/selectors';
import { RedirectLogistration } from '../common-components';
import RegistrationFailure from './RegistrationFailure';
import {
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, LOGIN_PAGE, REGISTER_PAGE,
} from '../data/constants';
import SocialAuthProviders from './SocialAuthProviders';
import ThirdPartyAuthAlert from './ThirdPartyAuthAlert';
import InstitutionLogistration, { RenderInstitutionButton } from './InstitutionLogistration';
import messages from './messages';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      email: '',
      fullname: '',
      username: '',
      password: '',
      country: '',
      errors: {
        email: '',
        fullname: '',
        username: '',
        password: '',
        country: '',
      },
      emailValid: false,
      nameValid: false,
      usernameValid: false,
      passwordValid: false,
      countryValid: false,
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
      username: this.state.username,
      password: this.state.password,
      name: this.state.fullname,
      honor_code: true,
      country: this.state.country,
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
      Object.entries(payload).forEach(([key, value]) => {
        this.validateInput(key, value);
      });
      return;
    }
    this.props.registerNewUser(payload);
  }

  handleOnChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
    this.validateInput(e.target.name, e.target.value);
  }

  validateInput(inputName, value) {
    const { errors } = this.state;
    let {
      emailValid,
      nameValid,
      usernameValid,
      passwordValid,
      countryValid,
    } = this.state;

    switch (inputName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        errors.email = emailValid ? '' : null;
        break;
      case 'fullname':
        nameValid = value.length >= 1;
        errors.fullname = nameValid ? '' : null;
        break;
      case 'username':
        usernameValid = value.length >= 2 && value.length <= 30;
        errors.username = usernameValid ? '' : null;
        break;
      case 'password':
        passwordValid = value.length >= 8 && value.match(/\d+/g);
        errors.password = passwordValid ? '' : null;
        break;
      case 'country':
        countryValid = value !== '';
        errors.country = countryValid ? '' : null;
        break;
      default:
        break;
    }

    this.setState({
      errors,
      emailValid,
      nameValid,
      usernameValid,
      passwordValid,
      countryValid,
    }, this.validateForm);
  }

  validateForm() {
    const {
      emailValid,
      nameValid,
      usernameValid,
      passwordValid,
      countryValid,
    } = this.state;
    this.setState({
      formValid: emailValid && nameValid && usernameValid && passwordValid && countryValid,
    });
  }

  renderCountryList() {
    const locale = getLocale();
    let items = [{ value: '', label: 'Country or Region of Residence (required)' }];
    items = items.concat(getCountryList(locale).map(({ code, name }) => ({ value: code, label: name })));
    return items;
  }

  render() {
    const { intl, submitState } = this.props;
    const {
      currentProvider, finishAuthUrl, providers, secondaryProviders,
    } = this.props.thirdPartyAuthContext;

    if (this.state.institutionLogin) {
      return (
        <InstitutionLogistration
          onSubmitHandler={this.handleInstitutionLogin}
          secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['logistration.register.institution.login.page.title'])}
          buttonTitle={intl.formatMessage(messages['logistration.register.institution.login.page.back.button'])}
        />
      );
    }

    return (
      <>
        <RedirectLogistration
          success={this.props.registrationResult.success}
          redirectUrl={this.props.registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
        />
        <div className="register-container mx-auto">
          {this.props.registrationError ? <RegistrationFailure errors={this.props.registrationError} /> : null}
          {currentProvider && (
            <ThirdPartyAuthAlert
              currentProvider={currentProvider}
              platformName={this.props.thirdPartyAuthContext.platformName}
              referrer="register"
            />
          )}
          <div className="text-left">
            <span>{intl.formatMessage(messages['logistration.already.have.an.edx.account'])}</span>
            <a href={LOGIN_PAGE}>{intl.formatMessage(messages['logistration.sign.in.hyperlink'])}</a>
          </div>
          {(providers.length || secondaryProviders.length) && !currentProvider ? (
            <div className="d-block mb-4 mt-4">
              <span className="d-block mx-auto mb-4 section-heading-line">
                {intl.formatMessage(messages['logistration.create.an.account.using'])}
              </span>
              <div className="row tpa-container">
                <SocialAuthProviders socialAuthProviders={providers} referrer={REGISTER_PAGE} />
              </div>
              <RenderInstitutionButton
                onSubmitHandler={this.handleInstitutionLogin}
                secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
                buttonTitle={intl.formatMessage(messages['logistration.register.institution.login.button'])}
              />
              <span className="d-block mx-auto text-center mt-4 section-heading-line">
                {intl.formatMessage(messages['logistration.create.a.new.one.here'])}
              </span>
            </div>
          ) : null}
          <form className="mb-4 mx-auto form-group">
            <ValidationFormGroup
              for="email"
              invalid={this.state.errors.email !== ''}
              invalidMessage="Enter a valid email address that contains at least 3 characters."
            >
              <label htmlFor="registrationEmail" className="h6 pt-3">Email (required)</label>
              <Input
                name="email"
                id="registrationEmail"
                type="email"
                placeholder="username@domain.com"
                value={this.state.email}
                onChange={e => this.handleOnChange(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="fullname"
              invalid={this.state.errors.fullname !== ''}
              invalidMessage="Enter your full name."
            >
              <label htmlFor="registrationName" className="h6 pt-3">Full Name (required)</label>
              <Input
                name="fullname"
                id="registrationName"
                type="text"
                placeholder="Name"
                value={this.state.fullname}
                onChange={e => this.handleOnChange(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="username"
              invalid={this.state.errors.username !== ''}
              invalidMessage="Username must be between 2 and 30 characters long."
            >
              <label htmlFor="registrationUsername" className="h6 pt-3">Public Username (required)</label>
              <Input
                name="username"
                id="registrationUsername"
                type="text"
                placeholder="Username"
                value={this.state.username}
                onChange={e => this.handleOnChange(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="password"
              invalid={this.state.errors.password !== ''}
              invalidMessage="This password is too short. It must contain at least 8 characters. This password must contain at least 1 number."
            >
              <label htmlFor="registrationPassword" className="h6 pt-3">Password (required)</label>
              <Input
                name="password"
                id="registrationPassword"
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={e => this.handleOnChange(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="country"
              invalid={this.state.errors.country !== ''}
              invalidMessage="Select your country or region of residence."
            >
              <label htmlFor="registrationCountry" className="h6 pt-3">Country (required)</label>
              <Input
                name="country"
                type="select"
                placeholder="Country or Region of Residence"
                value={this.state.country}
                options={this.renderCountryList()}
                onChange={e => this.handleOnChange(e)}
                required
              />
            </ValidationFormGroup>
            <span>By creating an account, you agree to the <a href="https://www.edx.org/edx-terms-service">Terms of Service and Honor Code</a> and you acknowledge that edX and each Member process your personal data in accordance with the <a href="https://www.edx.org/edx-privacy-policy">Privacy Policy</a>.</span>
            <StatefulButton
              type="submit"
              className="btn-primary submit mt-4"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['logistration.create.account.button']),
              }}
              onClick={this.handleSubmit}
            />
          </form>
        </div>
      </>
    );
  }
}

RegistrationPage.defaultProps = {
  registrationResult: null,
  registerNewUser: null,
  registrationError: null,
  submitState: DEFAULT_STATE,
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
  },
};


RegistrationPage.propTypes = {
  intl: intlShape.isRequired,
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  registrationError: PropTypes.shape({
    email: PropTypes.array,
    username: PropTypes.array,
  }),
  submitState: PropTypes.string,
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
    platformName: PropTypes.string,
    providers: PropTypes.array,
    secondaryProviders: PropTypes.array,
    finishAuthUrl: PropTypes.string,
    pipelineUserDetails: PropTypes.shape({
      email: PropTypes.string,
      fullname: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string,
    }),
  }),
};

const mapStateToProps = state => {
  const registrationResult = registrationRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  return {
    registrationError: state.logistration.registrationError,
    submitState: state.logistration.submitState,
    registrationResult,
    thirdPartyAuthContext,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    registerNewUser,
  },
)(injectIntl(RegistrationPage));
