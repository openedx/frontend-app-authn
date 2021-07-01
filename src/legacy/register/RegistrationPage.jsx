import React from 'react';

import camelCase from 'lodash.camelcase';
import { connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  injectIntl, intlShape, getCountryList, getLocale, FormattedMessage,
} from '@edx/frontend-platform/i18n';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Form, Hyperlink, StatefulButton } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { registerNewUser, fetchRealtimeValidations } from './data/actions';
import { registrationRequestSelector } from './data/selectors';
import messages from './messages';
import OptionalFields from './OptionalFields';
import RegistrationFailure from './RegistrationFailure';

import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration, AuthnValidationFormGroup,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE, VALID_EMAIL_REGEX,
} from '../data/constants';
import {
  getTpaProvider, getTpaHint, updatePathWithQueryParams, getAllPossibleQueryParam, setSurveyCookie, setCookie,
} from '../data/utils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    sendPageEvent('login_and_registration', 'register');
    this.intl = props.intl;
    this.queryParams = getAllPossibleQueryParam();
    this.tpaHint = getTpaHint();

    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      country: '',
      gender: '',
      yearOfBirth: '',
      goals: '',
      levelOfEducation: '',
      enableOptionalField: false,
      validationAlertMessages: {
        name: [{ user_message: '' }],
        username: [{ user_message: '' }],
        email: [{ user_message: '' }],
        password: [{ user_message: '' }],
        country: [{ user_message: '' }],
      },
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      },
      institutionLogin: false,
      formValid: false,
      startTime: Date.now(),
      updateFieldErrors: false,
      updateAlertErrors: false,
      registrationErrorsUpdated: false,
      optimizelyExperimentName: '',
      totalRegistrationTime: 0,
    };
  }

  componentDidMount() {
    const payload = { ...this.queryParams };

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.getThirdPartyAuthContext(payload);
    this.getExperiments();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.statusCode !== 403 && this.props.validations !== nextProps.validations) {
      const { errors } = this.state;
      const { fieldName } = this.state;
      const errorMsg = nextProps.validations.validation_decisions[fieldName];
      errors[fieldName] = errorMsg;
      this.setState({
        errors,
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
        registrationErrorsUpdated: true,
      });
      return false;
    }

    if (this.state.registrationErrorsUpdated && this.props.registrationError === nextProps.registrationError) {
      this.setState({
        formValid: false,
        registrationErrorsUpdated: false,
      });
      return false;
    }

    return true;
  }

  getExperiments = () => {
    const { optimizelyExperimentName } = window;

    if (optimizelyExperimentName) {
      this.setState({ optimizelyExperimentName });
    }
  };

  getCountryOptions = () => {
    const { intl } = this.props;
    return [{
      value: '',
      label: intl.formatMessage(messages['registration.country.label']),
    }].concat(getCountryList(getLocale()).map(({ code, name }) => ({ value: code, label: name })));
  }

  getOptionalFields() {
    const values = {};
    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS.split(',');
    optionalFields.forEach((key) => {
      values[camelCase(key)] = this.state[camelCase(key)];
    });

    return (
      <OptionalFields
        values={values}
        onChangeHandler={(fieldName, value) => { this.setState({ [fieldName]: value }); }}
      />
    );
  }

  handleInstitutionLogin = () => {
    this.setState(prevState => ({ institutionLogin: !prevState.institutionLogin }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { startTime } = this.state;
    const totalRegistrationTime = (Date.now() - startTime) / 1000;
    let payload = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      country: this.state.country,
      honor_code: true,
    };

    if (this.props.thirdPartyAuthContext.currentProvider) {
      payload.social_auth_provider = this.props.thirdPartyAuthContext.currentProvider;
    } else {
      payload.password = this.state.password;
    }

    const postParams = getAllPossibleQueryParam();
    payload = { ...payload, ...postParams };

    let finalValidation = this.state.formValid;
    if (!this.state.formValid) {
      Object.keys(payload).forEach(key => {
        finalValidation = this.validateInput(key, payload[key], payload);
      });
    }
    // Since optional fields are not validated we can add it to payload after required fields
    // have been validated. This will save us unwanted calls to validateInput()
    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS.split(',');
    optionalFields.forEach((key) => {
      const stateKey = camelCase(key);
      if (this.state[stateKey]) {
        payload[key] = this.state[stateKey];
      }
    });
    if (finalValidation) {
      payload.totalRegistrationTime = totalRegistrationTime;
      this.setState({
        totalRegistrationTime,
      }, () => {
        this.props.registerNewUser(payload);
      });
    }
  }

  checkNoFieldErrors(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => !validations[key]);
    return keyValidList.every((current) => current === true);
  }

  checkNoAlertErrors(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => {
      const validation = validations[key][0];
      return !validation.user_message;
    });
    return keyValidList.every((current) => current === true);
  }

  handleOnBlur(e) {
    const payload = {
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      honor_code: true,
      country: this.state.country,
    };
    const { name, value } = e.target;
    this.setState({
      updateFieldErrors: false,
      updateAlertErrors: false,
      fieldName: e.target.name,
    }, () => {
      this.validateInput(name, value, payload, false);
    });
  }

  handleOnChange(e) {
    if (!(e.target.name === 'username' && e.target.value.length > 30)) {
      this.setState({
        [e.target.name]: e.target.value,
        updateFieldErrors: false,
        updateAlertErrors: false,
      });
    }
  }

  handleOnFocus(e) {
    const { errors } = this.state;
    errors[e.target.name] = '';
    this.setState({ errors });
  }

  handleOnOptional(e) {
    const optionalEnable = this.state.enableOptionalField;
    const targetValue = e.target.id === 'additionalFields' ? !optionalEnable : e.target.checked;
    this.setState({
      enableOptionalField: targetValue,
      updateAlertErrors: false,
      updateFieldErrors: false,
    });
    sendTrackEvent('edx.bi.user.register.optional_fields_selected', {});
  }

  handleLoginLinkClickEvent() {
    sendTrackEvent('edx.bi.login_form.toggled', { category: 'user-engagement' });
  }

  validateInput(inputName, value, payload, updateAlertMessage = true) {
    const { errors } = this.state;
    const { intl, statusCode } = this.props;
    const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');

    let {
      formValid,
      updateFieldErrors,
      updateAlertErrors,
    } = this.state;
    switch (inputName) {
      case 'email':
        if (value.length < 1) {
          errors.email = intl.formatMessage(messages['email.validation.message']);
        } else if (value.length <= 2) {
          errors.email = intl.formatMessage(messages['email.ratelimit.less.chars.validation.message']);
        } else if (!emailRegex.test(value)) {
          errors.email = intl.formatMessage(messages['email.ratelimit.incorrect.format.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.email = '';
        }
        break;
      case 'name':
        if (value.length < 1) {
          errors.name = intl.formatMessage(messages['fullname.validation.message']);
        } else {
          errors.name = '';
        }
        break;
      case 'username':
        if (value.length < 1) {
          errors.username = intl.formatMessage(messages['username.validation.message']);
        } else if (value.length <= 1 || value.length > 30) {
          errors.username = intl.formatMessage(messages['username.ratelimit.less.chars.message']);
        } else if (!value.match(/^[a-zA-Z0-9_-]*$/i)) {
          errors.username = intl.formatMessage(messages['username.format.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.username = '';
        }
        break;
      case 'password':
        if (value.length < 1) {
          errors.password = intl.formatMessage(messages['register.page.password.validation.message']);
        } else if (value.length < 8) {
          errors.password = intl.formatMessage(messages['email.ratelimit.password.validation.message']);
        } else if (!value.match(/.*[0-9].*/i)) {
          errors.password = intl.formatMessage(messages['username.number.validation.message']);
        } else if (!value.match(/.*[a-zA-Z].*/i)) {
          errors.password = intl.formatMessage(messages['username.character.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.password = '';
        }
        break;
      case 'country':
        if (!value) {
          errors.country = intl.formatMessage(messages['country.validation.message']);
        } else {
          errors.country = '';
        }
        break;
      default:
        break;
    }

    if (updateAlertMessage) {
      updateFieldErrors = true;
      updateAlertErrors = true;
      formValid = this.checkNoFieldErrors(errors);
    }
    this.setState({
      formValid,
      updateFieldErrors,
      updateAlertErrors,
      errors,
    });
    return formValid;
  }

  updateFieldErrors(registrationError) {
    const {
      errors,
    } = this.state;
    Object.entries(registrationError).map(([key]) => {
      if (registrationError[key]) {
        errors[key] = registrationError[key][0].user_message;
      }
      return errors;
    });
  }

  updateValidationAlertMessages() {
    const {
      errors,
      validationAlertMessages,
    } = this.state;
    Object.entries(errors).map(([key, value]) => {
      if (validationAlertMessages[key]) {
        validationAlertMessages[key][0].user_message = value;
      }
      return validationAlertMessages;
    });
  }

  renderErrors() {
    let errorsObject = null;
    let { registrationErrorsUpdated } = this.state;
    const {
      updateAlertErrors,
      updateFieldErrors,
      validationAlertMessages,
    } = this.state;
    const { registrationError, submitState } = this.props;
    if (registrationError && registrationErrorsUpdated) {
      if (updateFieldErrors && submitState !== PENDING_STATE) {
        this.updateFieldErrors(registrationError);
      }
      registrationErrorsUpdated = false;
      errorsObject = registrationError;
    } else {
      if (updateAlertErrors && submitState !== PENDING_STATE) {
        this.updateValidationAlertMessages();
      }
      errorsObject = !this.checkNoAlertErrors(validationAlertMessages) ? validationAlertMessages : {};
    }
    return (
      <RegistrationFailure
        errors={errorsObject}
        isSubmitted={updateAlertErrors}
        submitButtonState={submitState}
      />
    );
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

  renderForm(currentProvider,
    providers,
    secondaryProviders,
    thirdPartyAuthApiStatus,
    finishAuthUrl,
    submitState,
    intl) {
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

    if (this.props.registrationResult.success) {
      setSurveyCookie('register');
      setCookie(getConfig().REGISTER_CONVERSION_COOKIE_NAME, true);

      // Fire optimizely events
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-register-conversion',
        tags: {
          value: this.state.totalRegistrationTime,
        },
      });

      if (this.state.optimizelyExperimentName !== 'progressiveProfilingConcept1') {
        window.optimizely.push({
          type: 'event',
          eventName: 'van_504_conversion_rate',
        });
        ['yearOfBirth', 'gender', 'levelOfEducation'].forEach(fieldName => {
          if (this.state[fieldName]) {
            window.optimizely.push({
              type: 'event',
              eventName: `van_504_${fieldName}`,
            });
          }
        });
      }
    }

    return (
      <>
        <Helmet>
          <title>{intl.formatMessage(messages['register.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        <RedirectLogistration
          success={this.props.registrationResult.success}
          redirectUrl={this.props.registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
          redirectToWelcomePage={this.state.optimizelyExperimentName === 'progressiveProfilingConcept1'}
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
              <p>
                {intl.formatMessage(messages['already.have.an.edx.account'])}
                <Hyperlink
                  className="ml-1"
                  destination={updatePathWithQueryParams(LOGIN_PAGE)}
                  onClick={this.handleLoginLinkClickEvent}
                >
                  {intl.formatMessage(messages['sign.in.hyperlink'])}
                </Hyperlink>
              </p>
              <hr className="mb-3 border-gray-200" />
              <h1 className="mb-3 h3">{intl.formatMessage(messages['create.a.new.account'])}</h1>
              <Form className="form-group">
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['fullname.label'])}
                  for="name"
                  name="name"
                  type="text"
                  invalid={this.state.errors.name !== ''}
                  ariaInvalid={this.state.errors.name !== ''}
                  invalidMessage={this.state.errors.name}
                  value={this.state.name}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.handleOnChange(e)}
                  onFocus={(e) => this.handleOnFocus(e)}
                  helpText={intl.formatMessage(messages['helptext.name'])}
                  inputFieldStyle="border-gray-600"
                />
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['username.label'])}
                  for="username"
                  name="username"
                  type="text"
                  className="data-hj-suppress"
                  invalid={this.state.errors.username !== ''}
                  ariaInvalid={this.state.errors.username !== ''}
                  invalidMessage={this.state.errors.username}
                  value={this.state.username}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.handleOnChange(e)}
                  onFocus={(e) => this.handleOnFocus(e)}
                  helpText={intl.formatMessage(messages['helptext.username'])}
                  inputFieldStyle="border-gray-600"
                />
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['register.page.email.label'])}
                  for="email"
                  name="email"
                  type="text"
                  className="data-hj-suppress"
                  invalid={this.state.errors.email !== ''}
                  ariaInvalid={this.state.errors.email !== ''}
                  invalidMessage={this.state.errors.email}
                  value={this.state.email}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.handleOnChange(e)}
                  onFocus={(e) => this.handleOnFocus(e)}
                  helpText={intl.formatMessage(messages['helptext.email'])}
                  inputFieldStyle="border-gray-600"
                />
                {!currentProvider && (
                  <AuthnValidationFormGroup
                    label={intl.formatMessage(messages['password.label'])}
                    for="password"
                    name="password"
                    type="password"
                    invalid={this.state.errors.password !== ''}
                    ariaInvalid={this.state.errors.password !== ''}
                    invalidMessage={this.state.errors.password}
                    value={this.state.password}
                    onBlur={(e) => this.handleOnBlur(e)}
                    onChange={(e) => this.handleOnChange(e)}
                    onFocus={(e) => this.handleOnFocus(e)}
                    helpText={intl.formatMessage(messages['helptext.password'])}
                    inputFieldStyle="border-gray-600"
                  />
                )}
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['registration.country.label'])}
                  for="country"
                  name="country"
                  type="select"
                  key="country"
                  invalid={this.state.errors.country !== ''}
                  ariaInvalid={this.state.errors.country !== ''}
                  invalidMessage={intl.formatMessage(messages['country.validation.message'])}
                  className="mb-0 data-hj-suppress"
                  value={this.state.country}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.handleOnChange(e)}
                  onFocus={(e) => this.handleOnFocus(e)}
                  selectOptions={this.getCountryOptions()}
                  inputFieldStyle="border-gray-600 "
                />
                <div id="honor-code" className="pt-10 small">
                  <FormattedMessage
                    id="register.page.terms.of.service.and.honor.code"
                    tagName="p"
                    defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                    Member process your personal data in accordance with the {privacyPolicy}."
                    description="Text that appears on registration form stating honor code and privacy policy"
                    values={{
                      platformName: getConfig().SITE_NAME,
                      tosAndHonorCode: (
                        <Hyperlink destination={getConfig().TOS_AND_HONOR_CODE} target="_blank">
                          {intl.formatMessage(messages['terms.of.service.and.honor.code'])}
                        </Hyperlink>
                      ),
                      privacyPolicy: (
                        <Hyperlink destination={getConfig().PRIVACY_POLICY} target="_blank">
                          {intl.formatMessage(messages['privacy.policy'])}
                        </Hyperlink>
                      ),
                    }}
                  />
                </div>
                {getConfig().REGISTRATION_OPTIONAL_FIELDS && localStorage.getItem('DESIGN_NAME') !== 'redesign' ? (
                  <AuthnValidationFormGroup
                    label={intl.formatMessage(messages['support.education.research'])}
                    for="optional"
                    name="optional"
                    type="checkbox"
                    value={this.state.enableOptionalField}
                    onClick={(e) => this.handleOnOptional(e)}
                    onBlur={null}
                    onChange={(e) => this.handleOnOptional(e)}
                    optionalFieldCheckbox
                    isChecked={this.state.enableOptionalField}
                    checkboxMessage={intl.formatMessage(messages['support.education.research'])}
                  />
                ) : null}
                { this.state.enableOptionalField ? this.getOptionalFields() : null }
                <StatefulButton
                  type="submit"
                  variant="brand"
                  state={submitState}
                  className="mt-3"
                  labels={{
                    default: intl.formatMessage(messages['create.account.button']),
                  }}
                  icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
                  onClick={this.handleSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                />
                {(providers.length || secondaryProviders.length || thirdPartyAuthApiStatus === PENDING_STATE)
                  && !currentProvider ? (
                    <div className="d-block mb-4 mt-4">
                      <hr className="mt-0 border-gray-200" />
                      <span className="d-block mb-4 text-left">
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

  render() {
    const { intl, submitState, thirdPartyAuthApiStatus } = this.props;
    const {
      currentProvider, finishAuthUrl, providers, secondaryProviders,
    } = this.props.thirdPartyAuthContext;

    if (this.tpaHint) {
      if (thirdPartyAuthApiStatus === PENDING_STATE) {
        return <Skeleton height={36} />;
      }
      const { provider, skipHintedLogin } = getTpaProvider(this.tpaHint, providers, secondaryProviders);
      if (skipHintedLogin) {
        window.location.href = getConfig().LMS_BASE_URL + provider.registerUrl;
        return null;
      }
      return provider ? (<EnterpriseSSO provider={provider} intl={intl} />)
        : this.renderForm(
          currentProvider,
          providers,
          secondaryProviders,
          thirdPartyAuthApiStatus,
          finishAuthUrl,
          submitState,
          intl,
        );
    }
    return this.renderForm(
      currentProvider,
      providers,
      secondaryProviders,
      thirdPartyAuthApiStatus,
      finishAuthUrl,
      submitState,
      intl,
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
    validations: state.register.validations,
    statusCode: state.register.statusCode,
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    fetchRealtimeValidations,
    registerNewUser,
  },
)(injectIntl(RegistrationPage));
