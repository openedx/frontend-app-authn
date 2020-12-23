import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Input,
  StatefulButton,
  Hyperlink,
  ValidationFormGroup,
} from '@edx/paragon';

import {
  injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import camelCase from 'lodash.camelcase';
import {
  getThirdPartyAuthContext,
  registerNewUser,
  fetchRegistrationForm,
  fetchRealtimeValidations,
} from './data/actions';
import { registrationRequestSelector, thirdPartyAuthContextSelector } from './data/selectors';
import { RedirectLogistration } from '../common-components';
import RegistrationFailure from './RegistrationFailure';
import {
  DEFAULT_REDIRECT_URL,
  DEFAULT_STATE,
  LOGIN_PAGE,
  REGISTER_PAGE,
  REGISTRATION_VALIDITY_MAP,
  REGISTRATION_OPTIONAL_MAP,
  REGISTRATION_EXTRA_FIELDS,
} from '../data/constants';
import SocialAuthProviders from './SocialAuthProviders';
import ThirdPartyAuthAlert from './ThirdPartyAuthAlert';
import InstitutionLogistration, { RenderInstitutionButton } from './InstitutionLogistration';
import messages from './messages';
import { processLink } from '../data/utils/dataUtils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.intl = props.intl;

    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      country: '',
      city: '',
      gender: '',
      yearOfBirth: '',
      mailingAddress: '',
      goals: '',
      honorCode: true,
      termsOfService: true,
      levelOfEducation: '',
      confirmEmail: '',
      enableOptionalField: false,
      validationFieldName: '',
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
        honorCode: '',
        termsOfService: '',
      },
      emailValid: false,
      nameValid: false,
      usernameValid: false,
      passwordValid: false,
      countryValid: false,
      honorCodeValid: false,
      termsOfServiceValid: false,
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
    this.props.fetchRegistrationForm();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.validations !== nextProps.validations) {
      const { errors } = this.state;
      const errorMsg = nextProps.validations.validation_decisions[this.state.validationFieldName];
      errors[this.state.validationFieldName] = errorMsg;
      this.setState({
        errors,
      });
      return false;
    }
    return true;
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
    };

    const fieldMap = { ...REGISTRATION_VALIDITY_MAP, ...REGISTRATION_OPTIONAL_MAP };
    Object.keys(fieldMap).forEach((key) => {
      const value = fieldMap[key];
      if (value) {
        payload[key] = this.state[camelCase(key)];
      }
    });

    const next = params.get('next');
    const courseId = params.get('course_id');
    if (next) {
      payload.next = params.next;
    }
    if (courseId) {
      payload.course_id = params.course_id;
    }

    if (!this.state.formValid) {
      // Special case where honor code and tos is a single field, true by default. We don't need
      // to validate this field
      Object.entries(payload).filter(([key]) => (key !== 'honor_code' || !('terms_of_service' in REGISTRATION_EXTRA_FIELDS)))
        .forEach(([key, value]) => {
          this.validateInput(key, value);
        });
      return;
    }
    this.props.registerNewUser(payload);
  }

  handleOnBlur(e) {
    this.setState({
      validationFieldName: e.target.name,
    });

    const payload = {
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      honor_code: this.state.honorCode,
      country: this.state.country,
    };
    this.props.fetchRealtimeValidations(payload);
  }

  handleOnChange(e) {
    const targetValue = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({
      [camelCase(e.target.name)]: targetValue,
    });
    this.validateInput(e.target.name, targetValue);
  }

  handleOnOptional(e) {
    const optionalEnable = this.state.enableOptionalField;
    const targetValue = e.target.id === 'additionalFields' ? !optionalEnable : e.target.checked;
    this.setState({
      enableOptionalField: targetValue,
    });
  }

  validateInput(inputName, value) {
    const { errors } = this.state;
    let {
      emailValid,
      nameValid,
      usernameValid,
      passwordValid,
      countryValid,
      honorCodeValid,
      termsOfServiceValid,
    } = this.state;

    switch (inputName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        errors.email = emailValid ? '' : this.intl.formatMessage(messages['logistration.email.validation.message']);
        break;
      case 'name':
        nameValid = value.length >= 1;
        errors.name = nameValid ? '' : this.intl.formatMessage(messages['logistration.fullname.validation.message']);
        break;
      case 'username':
        usernameValid = value.length >= 2 && value.length <= 30;
        errors.username = usernameValid ? '' : this.intl.formatMessage(messages['logistration.username.validation.message']);
        break;
      case 'password':
        passwordValid = !!(value.length >= 8 && value.match(/\d+/g));
        errors.password = passwordValid ? '' : this.intl.formatMessage(messages['logistration.register.page.password.validation.message']);
        break;
      case 'country':
        countryValid = value !== '';
        errors.country = countryValid ? '' : this.intl.formatMessage(messages['logistration.country.validation.message']);
        break;
      case 'honor_code':
        honorCodeValid = value !== false;
        errors.honorCode = honorCodeValid ? '' : null;
        break;
      case 'terms_of_service':
        termsOfServiceValid = value !== false;
        errors.termsOfService = termsOfServiceValid ? '' : null;
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
      honorCodeValid,
      termsOfServiceValid,
    }, this.validateForm);
  }

  validateForm() {
    const {
      emailValid,
      nameValid,
      usernameValid,
      passwordValid,
    } = this.state;

    const validityMap = REGISTRATION_VALIDITY_MAP;
    const validStates = [];
    Object.keys(validityMap).forEach((key) => {
      const value = validityMap[key];
      if (value) {
        const state = camelCase(key);
        const stateValid = `${state}Valid`;
        validStates.push(stateValid);
      }
    });
    let extraFieldsValid = true;
    validStates.forEach((value) => {
      extraFieldsValid = extraFieldsValid && this.state[value];
    });

    this.setState({
      formValid: emailValid && nameValid && usernameValid && passwordValid && extraFieldsValid,
    });
  }

  addExtraRequiredFields() {
    const fields = this.props.formData.fields.map((field) => {
      let options = null;
      if (REGISTRATION_EXTRA_FIELDS.includes(field.name)) {
        if (field.required) {
          const stateVar = camelCase(field.name);

          let beforeLink;
          let link;
          let linkText;
          let afterLink;

          const props = {
            id: field.name,
            name: field.name,
            type: field.type,
            value: this.state[stateVar],
            required: true,
            onChange: e => this.handleOnChange(e),
          };

          REGISTRATION_VALIDITY_MAP[field.name] = true;
          if (field.type === 'plaintext' && field.name === 'honor_code') { // special case where honor code and tos are combined
            afterLink = field.label;
            const nodes = [];
            do {
              const matches = processLink(afterLink);
              [beforeLink, link, linkText, afterLink] = matches;
              nodes.push(
                <>
                  {beforeLink}
                  <Hyperlink destination={link}>{linkText}</Hyperlink>
                </>,
              );
            } while (afterLink.includes('a href'));
            nodes.push(<>{afterLink}</>);

            return (
              <>
                <p {...props} />
                { nodes }
              </>
            );
          }
          if (field.type === 'checkbox') {
            const matches = processLink(field.label);
            [beforeLink, link, linkText, afterLink] = matches;
            props.checked = this.state[stateVar];
            return (
              <ValidationFormGroup
                for={field.name}
                invalid={this.state.errors[stateVar] !== ''}
                invalidMessage={field.errorMessages.required}
                className="custom-control"
              >
                <Input {...props} />
                {beforeLink}
                <Hyperlink destination={link}>{linkText}</Hyperlink>
                {afterLink}
              </ValidationFormGroup>
            );
          }
          if (field.type === 'select') {
            options = field.options.map((item) => ({
              value: item.value,
              label: item.name,
            }));
            props.options = options;
          }
          return (
            <ValidationFormGroup
              for={field.name}
              invalid={this.state.errors[stateVar] !== ''}
              invalidMessage={field.errorMessages.required}
            >
              <label htmlFor={field.name} className="h6 pt-3">{field.label} (required)</label>
              <Input {...props} />
            </ValidationFormGroup>
          );
        }
      }
      return (<></>);
    });
    return fields;
  }

  addExtraOptionalFields() {
    const fields = this.props.formData.fields.map((field) => {
      let options = null;
      if (REGISTRATION_EXTRA_FIELDS.includes(field.name)) {
        if (!field.required) {
          REGISTRATION_OPTIONAL_MAP[field.name] = true;
          const props = {
            id: field.name,
            name: field.name,
            type: field.type,
            onChange: e => this.handleOnChange(e),
          };
          if (field.name !== 'honor_code' && field.name !== 'country') {
            if (field.type === 'select') {
              options = field.options.map((item) => ({
                value: item.value,
                label: item.name,
              }));
              props.options = options;
            }
            return (
              <ValidationFormGroup
                for={field.name}
              >
                <label htmlFor={field.name} className="h6 pt-3">{field.label} (optional)</label>
                <Input {...props} />
              </ValidationFormGroup>
            );
          }
        }
      }
      return (<></>);
    });
    return fields;
  }

  render() {
    const { intl, submitState } = this.props;
    const {
      currentProvider, finishAuthUrl, providers, secondaryProviders,
    } = this.props.thirdPartyAuthContext;

    if (!this.props.formData) {
      return <div />;
    }

    if (this.state.institutionLogin) {
      return (
        <InstitutionLogistration
          onSubmitHandler={this.handleInstitutionLogin}
          secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['logistration.register.institution.login.page.title'])}
          buttonTitle={intl.formatMessage(messages['logistration.create.an.account'])}
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
              for="name"
              invalid={this.state.errors.name !== ''}
              invalidMessage={this.state.errors.name}
            >
              <label htmlFor="name" className="h6 pt-3">
                {intl.formatMessage(messages['logistration.fullname.label'])}
              </label>
              <Input
                name="name"
                id="name"
                type="text"
                placeholder=""
                value={this.state.name}
                onChange={e => this.handleOnChange(e)}
                onBlur={e => this.handleOnBlur(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="username"
              invalid={this.state.errors.username !== ''}
              invalidMessage={this.state.errors.username}
            >
              <label htmlFor="username" className="h6 pt-3">
                {intl.formatMessage(messages['logistration.username.label'])}
              </label>
              <Input
                name="username"
                id="username"
                type="text"
                placeholder=""
                value={this.state.username}
                onChange={e => this.handleOnChange(e)}
                onBlur={e => this.handleOnBlur(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="email"
              invalid={this.state.errors.email !== ''}
              invalidMessage={this.state.errors.email}
            >
              <label htmlFor="email" className="h6 pt-3">
                {intl.formatMessage(messages['logistration.register.page.email.label'])}
              </label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder=""
                value={this.state.email}
                onChange={e => this.handleOnChange(e)}
                onBlur={e => this.handleOnBlur(e)}
                required
              />
            </ValidationFormGroup>
            <ValidationFormGroup
              for="password"
              invalid={this.state.errors.password !== ''}
              invalidMessage={this.state.errors.password}
            >
              <label htmlFor="password" className="h6 pt-3">
                {intl.formatMessage(messages['logistration.password.label'])}
              </label>
              <Input
                name="password"
                id="password"
                type="password"
                placeholder=""
                value={this.state.password}
                onChange={e => this.handleOnChange(e)}
                onBlur={e => this.handleOnBlur(e)}
                required
              />
            </ValidationFormGroup>
            { this.addExtraRequiredFields() }
            <ValidationFormGroup
              for="optional"
              className="custom-control"
            >
              <Input
                name="optional"
                id="optional"
                type="checkbox"
                value={this.state.enableOptionalField}
                checked={this.state.enableOptionalField}
                onChange={e => this.handleOnOptional(e)}
                required
              />
              <p role="presentation" id="additionalFields" onClick={e => this.handleOnOptional(e)}>
                {intl.formatMessage(messages['logistration.support.education.research'])}
              </p>
            </ValidationFormGroup>
            { this.state.enableOptionalField ? this.addExtraOptionalFields() : null}
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
  formData: null,
  validations: null,
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

  fetchRegistrationForm: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    fields: PropTypes.array,
  }),
  fetchRealtimeValidations: PropTypes.func.isRequired,
  validations: PropTypes.shape({
    validation_decisions: PropTypes.shape({
      country: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
      password: PropTypes.string,
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
    formData: state.logistration.formData,
    validations: state.logistration.validations,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    fetchRegistrationForm,
    fetchRealtimeValidations,
    registerNewUser,
  },
)(injectIntl(RegistrationPage));
