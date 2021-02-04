import React from 'react';
import { connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import PropTypes from 'prop-types';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  Input,
  StatefulButton,
  Hyperlink,
  ValidationFormGroup,
  Form,
} from '@edx/paragon';

import {
  injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import camelCase from 'lodash.camelcase';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  registerNewUser,
  fetchRegistrationForm,
  fetchRealtimeValidations,
} from './data/actions';
import { registrationRequestSelector } from './data/selectors';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration,
} from '../common-components';
import RegistrationFailure from './RegistrationFailure';
import {
  DEFAULT_REDIRECT_URL,
  DEFAULT_STATE,
  PENDING_STATE,
  LOGIN_PAGE,
  REGISTER_PAGE,
  REGISTRATION_VALIDITY_MAP,
  REGISTRATION_OPTIONAL_MAP,
  REGISTRATION_EXTRA_FIELDS,
} from '../data/constants';
import messages from './messages';
import processLink from '../data/utils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    sendPageEvent('login_and_registration', 'register');
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
      validationErrorsAlertMessages: {
        name: [{ user_message: '' }],
        username: [{ user_message: '' }],
        email: [{ user_message: '' }],
        emailFormat: [{ user_message: '' }],
        password: [{ user_message: '' }],
        country: [{ user_message: '' }],
      },
      currentValidations: null,
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
      honorCodeValid: true,
      termsOfServiceValid: false,
      institutionLogin: false,
      formValid: false,
      submitCount: 0,
      isSubmitted: false,
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
    if (nextProps.statusCode !== 403 && this.props.validations !== nextProps.validations) {
      const { errors } = this.state;
      const errorMsg = nextProps.validations.validation_decisions[this.state.validationFieldName];
      errors[this.state.validationFieldName] = errorMsg;
      const stateValidKey = `${camelCase(this.state.validationFieldName)}Valid`;
      const currentValidations = nextProps.validations.validation_decisions;

      this.setState({
        [stateValidKey]: !errorMsg,
        errors,
        currentValidations,
      });
      return false;
    }

    if (this.props.thirdPartyAuthContext.pipelineUserDetails !== nextProps.thirdPartyAuthContext.pipelineUserDetails) {
      this.setState({
        ...nextProps.thirdPartyAuthContext.pipelineUserDetails,
      });
      return false;
    }

    if (this.props.registrationError !== nextProps.registrationError) {
      this.setState({
        formValid: false,
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
    this.state.isSubmitted = true;
    const params = (new URL(document.location)).searchParams;
    const payload = {};
    const payloadMap = new Map();
    payloadMap.set('name', this.state.name);
    payloadMap.set('username', this.state.username);
    payloadMap.set('email', this.state.email);

    if (!this.props.thirdPartyAuthContext.currentProvider) {
      payloadMap.set('password', this.state.password);
    }

    const fieldMap = { ...REGISTRATION_VALIDITY_MAP, ...REGISTRATION_OPTIONAL_MAP };
    Object.entries(fieldMap).forEach(([key, value]) => {
      if (value) {
        payloadMap.set(key, this.state[camelCase(key)]);
      }
    });
    payloadMap.forEach((value, key) => { payload[key] = value; });

    const next = params.get('next');
    const courseId = params.get('course_id');
    if (next) {
      payload.next = next;
    }
    if (courseId) {
      payload.course_id = courseId;
    }

    let finalValidation = this.isFormValid();
    if (!this.isFormValid()) {
      // Special case where honor code and tos is a single field, true by default. We don't need
      // to validate this field
      payloadMap.forEach((value, key) => {
        if (key !== 'honor_code' || 'terms_of_service' in REGISTRATION_VALIDITY_MAP) {
          finalValidation = this.validateInput(key, value);
        }
      });
    }
    if (finalValidation) {
      this.props.registerNewUser(payload);
    } else {
      this.props.fetchRealtimeValidations(payload);
    }
  }

  checkNoValidationsErrors(validations) {
    let keyValidList = null;
    keyValidList = Object.entries(validations).map(([key]) => {
      const validation = validations[key][0];
      return !validation.user_message;
    });
    return keyValidList.every((current) => current === true);
  }

  isFormValid() {
    return this.state.formValid;
  }

  handleOnBlur(e) {
    this.state.isSubmitted = false;
    if (this.props.statusCode === 403) {
      this.validateInput(e.target.name, e.target.value, 'blurCase');
      return;
    }
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
  }

  handleOnOptional(e) {
    const optionalEnable = this.state.enableOptionalField;
    const targetValue = e.target.id === 'additionalFields' ? !optionalEnable : e.target.checked;
    this.setState({
      enableOptionalField: targetValue,
    });
    sendTrackEvent('edx.bi.user.register.optional_fields_selected', {});
  }

  handleOnClick(e) {
    if (this.state.currentValidations && this.props.statusCode !== 403) {
      const { errors } = this.state;
      const fieldName = e.target.name;
      errors[fieldName] = this.state.currentValidations[fieldName];
      const stateValidKey = `${camelCase(fieldName)}Valid`;
      this.setState(prevState => ({
        [stateValidKey]: !prevState.currentValidations[fieldName],
        errors,
      }));
    }
  }

  handleLoginLinkClickEvent() {
    sendTrackEvent('edx.bi.login_form.toggled', { category: 'user-engagement' });
  }

  validateInput(inputName, value, blurCase) {
    const {
      errors,
      validationErrorsAlertMessages,
    } = this.state;

    let {
      honorCodeValid,
      termsOfServiceValid,
      formValid,
      submitCount,
    } = this.state;

    const validations = this.state.currentValidations;
    switch (inputName) {
      case 'email':
        if (this.props.statusCode !== 403 && validations && validations.email) {
          validationErrorsAlertMessages.email = [{ user_message: validations.email }];
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'email.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.email = errorEmpty;
          }
          errors.email = errorEmpty[0].user_message;
        } else {
          const errorCharlength = this.generateUserMessage(value.length <= 2, 'email.ratelimit.less.chars.validation.message');
          const formatError = this.generateUserMessage(!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i), 'email.ratelimit.incorrect.format.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.email = value.length <= 2 ? errorCharlength : formatError;
          }
          errors.email = value.length <= 2 ? errorCharlength[0].user_message : formatError[0].user_message;
        }
        break;
      case 'name':
        if (this.props.statusCode !== 403 && validations && validations.name) {
          validationErrorsAlertMessages.name = [{ user_message: validations.name }];
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'fullname.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.name = errorEmpty;
          }
          errors.name = errorEmpty[0].user_message;
        } else {
          validationErrorsAlertMessages.name = [{ user_message: '' }];
          errors.name = validationErrorsAlertMessages.name[0].user_message;
        }
        break;
      case 'username':
        if (this.props.statusCode !== 403 && validations && validations.username) {
          validationErrorsAlertMessages.username = [{ user_message: validations.username }];
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'username.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.username = errorEmpty;
          }
          errors.username = errorEmpty[0].user_message;
        } else if (value.length <= 1) {
          const errorCharLength = this.generateUserMessage(value.length <= 1, 'username.ratelimit.less.chars.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.username = errorCharLength;
          }
          errors.username = errorCharLength[0].user_message;
        } else if (!value.match(/^([a-zA-Z0-9_-])$/i)) {
          const formatError = this.generateUserMessage(!value.match(/^[a-zA-Z0-9_-]*$/i), 'username.format.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.username = formatError;
          }
          errors.username = formatError[0].user_message;
        }
        break;
      case 'password':
        if (this.props.statusCode !== 403 && validations && validations.password) {
          validationErrorsAlertMessages.password = [{ user_message: validations.password }];
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'register.page.password.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.password = errorEmpty;
          }
          errors.password = errorEmpty[0].user_message;
        } else if (value.length < 8) {
          const errorCharlength = this.generateUserMessage(value.length < 8, 'email.ratelimit.password.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.password = errorCharlength;
          }
          errors.password = errorCharlength[0].user_message;
        } else if (!value.match(/.*[0-9].*/i)) {
          const formatError = this.generateUserMessage(!value.match(/.*[0-9].*/i), 'username.number.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.password = formatError;
          }
          errors.password = formatError[0].user_message;
        } else {
          const formatError = this.generateUserMessage(!value.match(/.*[a-zA-Z].*/i), 'username.character.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.password = formatError;
          }
          errors.password = formatError[0].user_message;
        }
        break;
      case 'country':
        if (this.props.statusCode !== 403 && validations && validations.country) {
          validationErrorsAlertMessages.country = [{ user_message: validations.country }];
        } else {
          const emptyError = this.generateUserMessage(value === '', 'country.validation.message');
          if (blurCase === true) {
            validationErrorsAlertMessages.country = emptyError;
          }
          errors.country = emptyError[0].user_message;
        }
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

    if (!blurCase) {
      submitCount++;
    }
    formValid = this.checkNoValidationsErrors(validationErrorsAlertMessages);
    this.setState({
      formValid,
      validationErrorsAlertMessages,
      honorCodeValid,
      termsOfServiceValid,
      submitCount,
      errors,
    });
    return formValid;
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
            props.type = 'hidden';
            const nodes = [];
            do {
              const matches = processLink(afterLink);
              [beforeLink, link, linkText, afterLink] = matches;
              nodes.push(
                <React.Fragment key={link}>
                  {beforeLink}
                  <Hyperlink destination={link}>{linkText}</Hyperlink>
                </React.Fragment>,
              );
            } while (afterLink.includes('a href'));
            nodes.push(<React.Fragment key={afterLink}>{afterLink}</React.Fragment>);

            return (
              <React.Fragment key={field.type}>
                <input {...props} />
                <ValidationFormGroup
                  for={field.name}
                  key={field.name}
                  className="pt-10 small"
                >
                  { nodes }
                </ValidationFormGroup>
              </React.Fragment>
            );
          }
          if (field.type === 'checkbox') {
            const matches = processLink(field.label);
            [beforeLink, link, linkText, afterLink] = matches;
            props.checked = this.state[stateVar];
            return (
              <ValidationFormGroup
                for={field.name}
                key={field.name}
                invalid={this.state.errors[stateVar] !== ''}
                invalidMessage={field.errorMessages.required}
                className="custom-control small"
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
            props.onBlur = e => this.handleOnBlur(e);
            props.onClick = e => this.handleOnClick(e);
            props.onChange = e => this.handleOnChange(e);
          }
          return (
            <ValidationFormGroup
              for={field.name}
              key={field.name}
              invalid={this.state.errors[stateVar] !== ''}
              invalidMessage={field.errorMessages.required}
              className="mb-0"
            >
              <label htmlFor={field.name} className="h6 pt-10">{field.label} (required)</label>
              <Input {...props} />
            </ValidationFormGroup>
          );
        }
      }
      return null;
    });
    return fields;
  }

  addExtraOptionalFields() {
    const fields = this.props.formData.fields.map((field) => {
      let options = null;
      let cssClass = 'mb-0';
      if (REGISTRATION_EXTRA_FIELDS.includes(field.name)) {
        if (!field.required && field.name !== 'honor_code' && field.name !== 'country') {
          REGISTRATION_OPTIONAL_MAP[field.name] = true;
          const props = {
            id: field.name,
            name: field.name,
            type: field.type,
            onChange: e => this.handleOnChange(e),
          };

          if (field.type === 'select') {
            options = field.options.map((item) => ({
              value: item.value,
              label: item.name,
            }));
            props.options = options;
          }
          if (field.name === 'gender') {
            cssClass += ' opt-inline-field';
          }

          if (field.name === 'year_of_birth') {
            cssClass += ' opt-inline-field opt-year-field';
          }

          return (
            <ValidationFormGroup
              for={field.name}
              key={field.name}
              className={cssClass}
            >
              <label htmlFor={field.name} className="h6 pt-10">
                {field.label} {this.props.intl.formatMessage(messages['register.optional.label'])}
              </label>
              <Input {...props} />
            </ValidationFormGroup>
          );
        }
      }
      return null;
    });
    return fields;
  }

  generateUserMessage(isFieldInValid, messageID) {
    return [{ user_message: isFieldInValid ? this.intl.formatMessage(messages[messageID]) : '' }];
  }

  updateFieldErrors(errorMessages) {
    const {
      errors,
    } = this.state;
    if (errorMessages.email) {
      errors.email = errorMessages.email[0].user_message;
    }
    if (errorMessages.username) {
      errors.username = errorMessages.username[0].user_message;
    }
    if (errorMessages.name) {
      errors.name = errorMessages.name[0].user_message;
    }
    if (errorMessages.password) {
      errors.password = errorMessages.password[0].user_message;
    }
    if (errorMessages.country) {
      errors.country = errorMessages.country[0].user_message;
    }
  }

  renderErrors() {
    let errorsObject = null;
    if (!this.checkNoValidationsErrors(this.state.validationErrorsAlertMessages)) {
      this.updateFieldErrors(this.state.validationErrorsAlertMessages);
      errorsObject = this.state.validationErrorsAlertMessages;
    } else if (this.props.registrationError) {
      if (this.state.isSubmitted) {
        this.updateFieldErrors(this.props.registrationError);
      }
      errorsObject = this.props.registrationError;
    } else {
      return null;
    }
    return <RegistrationFailure errors={errorsObject} submitCount={this.state.submitCount} />;
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    let thirdPartyComponent = null;
    if ((providers.length || secondaryProviders.length) && !currentProvider) {
      thirdPartyComponent = (
        <>
          <RenderInstitutionButton
            onSubmitHandler={this.handleInstitutionLogin}
            secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
            buttonTitle={intl.formatMessage(messages['register.institution.login.button'])}
          />
          <div className="row tpa-container">
            <SocialAuthProviders socialAuthProviders={providers} referrer={REGISTER_PAGE} />
          </div>
        </>
      );
    } else if (thirdPartyAuthApiStatus === PENDING_STATE) {
      thirdPartyComponent = <Skeleton height={36} count={2} />;
    }
    return thirdPartyComponent;
  }

  render() {
    const { intl, submitState, thirdPartyAuthApiStatus } = this.props;
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
          headingTitle={intl.formatMessage(messages['register.institution.login.page.title'])}
          buttonTitle={intl.formatMessage(messages['create.an.account'])}
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
        <div className="d-flex justify-content-center m-4">
          <div className="d-flex flex-column">
            <div className="mw-500">
              {this.renderErrors()}
              {currentProvider && (
                <ThirdPartyAuthAlert
                  currentProvider={currentProvider}
                  platformName={this.props.thirdPartyAuthContext.platformName}
                  referrer={REGISTER_PAGE}
                />
              )}
              <div className="text-left">
                <span className="mr-1">{intl.formatMessage(messages['already.have.an.edx.account'])}</span>
                <a href={LOGIN_PAGE} onClick={this.handleLoginLinkClickEvent}>{intl.formatMessage(messages['sign.in.hyperlink'])}</a>
              </div>
              <hr className="mb-20 border-gray-200" />
              <h3 className="mb-20">{intl.formatMessage(messages['create.a.new.account'])}</h3>
              <Form className="form-group">
                <ValidationFormGroup
                  for="name"
                  invalid={this.state.errors.name !== ''}
                  invalidMessage={this.state.errors.name}
                  helpText="This name will be used by any certificates that you earn."
                >
                  <label htmlFor="name" className="h6 pt-10">
                    {intl.formatMessage(messages['fullname.label'])}
                  </label>
                  <Input
                    name="name"
                    id="name"
                    type="text"
                    placeholder=""
                    value={this.state.name}
                    onChange={e => this.handleOnChange(e)}
                    onBlur={e => this.handleOnBlur(e)}
                    onClick={e => this.handleOnClick(e)}
                    required
                  />
                </ValidationFormGroup>
                <ValidationFormGroup
                  for="username"
                  invalid={this.state.errors.username !== ''}
                  invalidMessage={this.state.errors.username}
                  helpText="The name that will identify you in your courses. It cannot be changed later."
                >
                  <label htmlFor="username" className="h6 pt-10">
                    {intl.formatMessage(messages['username.label'])}
                  </label>
                  <Input
                    name="username"
                    id="username"
                    type="text"
                    placeholder=""
                    value={this.state.username}
                    maxLength="30"
                    onChange={e => this.handleOnChange(e)}
                    onBlur={e => this.handleOnBlur(e)}
                    onClick={e => this.handleOnClick(e)}
                    required
                  />
                </ValidationFormGroup>
                <ValidationFormGroup
                  for="email"
                  invalid={this.state.errors.email !== ''}
                  invalidMessage={this.state.errors.email}
                  helpText="This is what you will use to login."
                >
                  <label htmlFor="email" className="h6 pt-10">
                    {intl.formatMessage(messages['register.page.email.label'])}
                  </label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="username@domain.com"
                    value={this.state.email}
                    onChange={e => this.handleOnChange(e)}
                    onBlur={e => this.handleOnBlur(e)}
                    onClick={e => this.handleOnClick(e)}
                    required
                  />
                </ValidationFormGroup>
                {!currentProvider && (
                  <ValidationFormGroup
                    for="password"
                    invalid={this.state.errors.password !== ''}
                    invalidMessage={this.state.errors.password}
                    helpText="Your password must contain at least 8 characters, including 1 letter & 1 number."
                  >
                    <label htmlFor="password" className="h6 pt-10">
                      {intl.formatMessage(messages['password.label'])}
                    </label>
                    <Input
                      name="password"
                      id="password"
                      type="password"
                      placeholder=""
                      value={this.state.password}
                      onChange={e => this.handleOnChange(e)}
                      onBlur={e => this.handleOnBlur(e)}
                      onClick={e => this.handleOnClick(e)}
                      required
                    />
                  </ValidationFormGroup>
                )}
                { this.addExtraRequiredFields() }
                <ValidationFormGroup
                  for="optional"
                  className="custom-control pt-10 mb-0"
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
                  <p role="presentation" id="additionalFields" className="mb-0 small" onClick={e => this.handleOnOptional(e)}>
                    {intl.formatMessage(messages['support.education.research'])}
                  </p>
                </ValidationFormGroup>
                { this.state.enableOptionalField ? this.addExtraOptionalFields() : null}
                <StatefulButton
                  type="button"
                  variant="brand"
                  state={submitState}
                  className="mt-20"
                  labels={{
                    default: intl.formatMessage(messages['create.account.button']),
                  }}
                  icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
                  onClick={this.handleSubmit}
                />
                {(providers.length || secondaryProviders.length || thirdPartyAuthApiStatus === PENDING_STATE)
                  && !currentProvider ? (
                    <div className="d-block mb-4 mt-4">
                      <hr className="mt-0 border-gray-200" />
                      <span className="d-blockmb-4 text-left">
                        {intl.formatMessage(messages['create.an.account.using'])}
                      </span>
                    </div>
                  ) : null}
                {this.renderThirdPartyAuth(providers,
                  secondaryProviders,
                  currentProvider,
                  thirdPartyAuthApiStatus,
                  intl)}
              </Form>
            </div>
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
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: 'pending',
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
  },
  formData: null,
  validations: null,
  statusCode: null,
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
    country: PropTypes.array,
    password: PropTypes.array,
    name: PropTypes.array,
  }),
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
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
  statusCode: PropTypes.number,
};

const mapStateToProps = state => {
  const registrationResult = registrationRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  return {
    registrationError: state.register.registrationError,
    submitState: state.register.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    registrationResult,
    thirdPartyAuthContext,
    formData: state.register.formData,
    validations: state.register.validations,
    statusCode: state.register.statusCode,
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
