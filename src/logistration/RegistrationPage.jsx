import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Input, ValidationFormGroup,
} from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import {
  getLocale,
  getCountryList,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';

import { getThirdPartyAuthContext, registerNewUser } from './data/actions';
import { registrationRequestSelector, thirdPartyAuthContextSelector } from './data/selectors';
import { DEFAULT_REDIRECT_URL } from '../data/constants';
import RedirectLogistration from './RedirectLogistration';
import RegistrationFailure from './RegistrationFailure';
import InstitutionLogistration, { RenderInstitutionButton } from './InstitutionLogistration';
import messages from './messages';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      country: '',
      errors: {
        email: '',
        name: '',
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
      name: this.state.name,
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
      case 'name':
        nameValid = value.length >= 1;
        errors.name = nameValid ? '' : null;
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
    if (this.state.institutionLogin) {
      return (
        <InstitutionLogistration
          onSubmitHandler={this.handleInstitutionLogin}
          secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
          headingTitle={this.props.intl.formatMessage(messages['logistration.register.institution.login.page.title'])}
          buttonTitle={this.props.intl.formatMessage(messages['logistration.register.institution.login.page.back.button'])}
        />
      );
    }
    return (
      <>
        <RedirectLogistration
          success={this.props.registrationResult.success}
          redirectUrl={this.props.registrationResult.redirectUrl}
        />
        <div className="logistration-container d-flex flex-column align-items-center mx-auto" style={{ width: '30rem' }}>
          {this.props.registrationError ? <RegistrationFailure errors={this.props.registrationError} /> : null}
          <div className="mb-4">
            <FontAwesomeIcon className="d-block mx-auto fa-2x" icon={faGraduationCap} />
            <h4 className="d-block mx-auto">Start learning now!</h4>
          </div>
          <div className="d-block mb-4">
            <span className="d-block mx-auto mb-4 section-heading-line">Create an account using</span>
            <button type="button" className="btn-social facebook"><FontAwesomeIcon className="mr-2" icon={faFacebookF} />Facebook</button>
            <button type="button" className="btn-social google"><FontAwesomeIcon className="mr-2" icon={faGoogle} />Google</button>
            <button type="button" className="btn-social microsoft mb-3"><FontAwesomeIcon className="mr-2" icon={faMicrosoft} />Microsoft</button>
            <RenderInstitutionButton
              onSubmitHandler={this.handleInstitutionLogin}
              secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
              buttonTitle={this.props.intl.formatMessage(messages['logistration.register.institution.login.button'])}
            />
            <span className="d-block mx-auto text-center mt-4 section-heading-line">or create a new one here</span>
          </div>

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
              for="name"
              invalid={this.state.errors.name !== ''}
              invalidMessage="Enter your full name."
            >
              <label htmlFor="registrationName" className="h6 pt-3">Full Name (required)</label>
              <Input
                name="name"
                id="registrationName"
                type="text"
                placeholder="Name"
                value={this.state.name}
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
            <Button
              className="btn-primary mt-4 submit"
              onClick={this.handleSubmit}
              inputRef={(input) => {
                this.button = input;
              }}
            >
              Create Account
            </Button>
          </form>
          <div className="text-center mb-2 pt-2">
            <span>Already have an edX account?</span>
            <a href="/login"> Sign in.</a>
          </div>
        </div>
      </>
    );
  }
}
RegistrationPage.defaultProps = {
  registrationResult: null,
  registerNewUser: null,
  registrationError: null,
  thirdPartyAuthContext: {},
};


RegistrationPage.propTypes = {
  intl: intlShape.isRequired,
  registerNewUser: PropTypes.func,
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  registrationError: PropTypes.shape({
    email: PropTypes.array,
    username: PropTypes.array,
  }),
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
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
    registrationResult,
    thirdPartyAuthContext,
    registrationError: state.logistration.registrationError,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    registerNewUser,
  },
)(injectIntl(RegistrationPage));
