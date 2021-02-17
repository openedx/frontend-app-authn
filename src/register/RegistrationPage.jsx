import React from 'react';

import camelCase from 'lodash.camelcase';
import { connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
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
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';
import { getTpaProvider } from '../data/utils';

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
      gender: '',
      yearOfBirth: '',
      goals: '',
      levelOfEducation: '',
      enableOptionalField: false,
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
      },
      institutionLogin: false,
      formValid: false,
      assignRegistrationErrorsToField: true,
    };
  }

  componentDidMount() {
    const params = (new URL(document.location)).searchParams;
    const tpaHint = params.get('tpa_hint');
    const payload = {
      redirect_to: params.get('next') || DEFAULT_REDIRECT_URL,
    };

    if (tpaHint) {
      payload.tpa_hint = tpaHint;
    }
    this.props.getThirdPartyAuthContext(payload);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.statusCode !== 403 && this.props.validations !== nextProps.validations) {
      const { errors } = this.state;
      const { fieldName } = nextProps.validations.validation_decisions;
      const errorMsg = nextProps.validations.validation_decisions[fieldName];
      errors[fieldName] = errorMsg;
      const currentValidations = nextProps.validations.validation_decisions;

      this.setState({
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

  getCountryOptions = () => {
    const { intl } = this.props;
    return [{
      value: '',
      label: intl.formatMessage(messages['registration.country.label']),
    }].concat(getCountryList(getLocale()).map(({ code, name }) => ({ value: code, label: name })));
  }

  getOptionalFields() {
    const values = {};
    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS.split(' ');
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
    const params = (new URL(document.location)).searchParams;
    const payload = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      country: this.state.country,
      honor_code: true,
    };

    if (!this.props.thirdPartyAuthContext.currentProvider) {
      payload.password = this.state.password;
    }

    const next = params.get('next');
    const courseId = params.get('course_id');
    if (next) {
      payload.next = next;
    }
    if (courseId) {
      payload.course_id = courseId;
    }

    let finalValidation = this.state.formValid;
    if (!this.state.formValid) {
      Object.keys(payload).forEach(key => {
        finalValidation = this.validateInput(key, payload[key]);
      });
    }
    // Since optional fields are not validated we can add it to payload after required fields
    // have been validated. This will save us unwanted calls to validateInput()
    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS.split(' ');
    optionalFields.forEach((key) => {
      const stateKey = camelCase(key);
      if (this.state[stateKey]) {
        payload[key] = this.state[stateKey];
      }
    });
    if (finalValidation) {
      this.props.registerNewUser(payload);
    } else {
      this.props.fetchRealtimeValidations(payload);
    }
  }

  checkNoValidationsErrors(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => {
      const validation = validations[key][0];
      return !validation.user_message;
    });
    return keyValidList.every((current) => current === true);
  }

  handleOnBlur(e) {
    const { name, value } = e.target;
    if (this.props.statusCode === 403) {
      this.setState({
        assignRegistrationErrorsToField: false,
      }, () => {
        this.validateInput(name, value, false);
      });
      return;
    }
    const payload = {
      fieldName: e.target.name,
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      honor_code: true,
      country: this.state.country,
    };
    this.setState({
      assignRegistrationErrorsToField: false,
    });

    this.props.fetchRealtimeValidations(payload);
  }

  handleOnOptional(e) {
    const optionalEnable = this.state.enableOptionalField;
    const targetValue = e.target.id === 'additionalFields' ? !optionalEnable : e.target.checked;
    this.setState({
      enableOptionalField: targetValue,
    });
    sendTrackEvent('edx.bi.user.register.optional_fields_selected', {});
  }

  handleLoginLinkClickEvent() {
    sendTrackEvent('edx.bi.login_form.toggled', { category: 'user-engagement' });
  }

  validateInput(inputName, value, showAlertMessageOnBlurEvent = true) {
    const {
      errors,
      validationErrorsAlertMessages,
    } = this.state;

    let { formValid, assignRegistrationErrorsToField } = this.state;
    const validations = this.state.currentValidations;
    switch (inputName) {
      case 'email':
        if (this.props.statusCode !== 403 && validations && validations.email) {
          validationErrorsAlertMessages.email = [{ user_message: validations.email }];
          errors.email = validations.email;
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'email.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.email = errorEmpty;
          }
          errors.email = errorEmpty[0].user_message;
        } else {
          const errorCharlength = this.generateUserMessage(value.length <= 2, 'email.ratelimit.less.chars.validation.message');
          const formatError = this.generateUserMessage(!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i), 'email.ratelimit.incorrect.format.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.email = value.length <= 2 ? errorCharlength : formatError;
          }
          errors.email = value.length <= 2 ? errorCharlength[0].user_message : formatError[0].user_message;
        }
        break;
      case 'name':
        if (this.props.statusCode !== 403 && validations && validations.name) {
          validationErrorsAlertMessages.name = [{ user_message: validations.name }];
          errors.name = validations.name;
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'fullname.validation.message');
          if (showAlertMessageOnBlurEvent) {
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
          errors.username = validations.username;
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'username.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.username = errorEmpty;
          }
          errors.username = errorEmpty[0].user_message;
        } else if (value.length <= 1) {
          const errorCharLength = this.generateUserMessage(value.length <= 1, 'username.ratelimit.less.chars.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.username = errorCharLength;
          }
          errors.username = errorCharLength[0].user_message;
        } else if (!value.match(/^([a-zA-Z0-9_-])$/i)) {
          const formatError = this.generateUserMessage(!value.match(/^[a-zA-Z0-9_-]*$/i), 'username.format.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.username = formatError;
          }
          errors.username = formatError[0].user_message;
        }
        break;
      case 'password':
        if (this.props.statusCode !== 403 && validations && validations.password) {
          validationErrorsAlertMessages.password = [{ user_message: validations.password }];
          errors.password = validations.password;
        } else if (value.length < 1) {
          const errorEmpty = this.generateUserMessage(value.length < 1, 'register.page.password.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.password = errorEmpty;
          }
          errors.password = errorEmpty[0].user_message;
        } else if (value.length < 8) {
          const errorCharlength = this.generateUserMessage(value.length < 8, 'email.ratelimit.password.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.password = errorCharlength;
          }
          errors.password = errorCharlength[0].user_message;
        } else if (!value.match(/.*[0-9].*/i)) {
          const formatError = this.generateUserMessage(!value.match(/.*[0-9].*/i), 'username.number.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.password = formatError;
          }
          errors.password = formatError[0].user_message;
        } else {
          const formatError = this.generateUserMessage(!value.match(/.*[a-zA-Z].*/i), 'username.character.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.password = formatError;
          }
          errors.password = formatError[0].user_message;
        }
        break;
      case 'country':
        if (this.props.statusCode !== 403 && validations && validations.country) {
          validationErrorsAlertMessages.country = [{ user_message: validations.country }];
          errors.country = validations.country;
        } else {
          const emptyError = this.generateUserMessage(value === '', 'country.validation.message');
          if (showAlertMessageOnBlurEvent) {
            validationErrorsAlertMessages.country = emptyError;
          }
          errors.country = emptyError[0].user_message;
        }
        break;
      default:
        break;
    }

    if (showAlertMessageOnBlurEvent) {
      assignRegistrationErrorsToField = true;
      formValid = this.checkNoValidationsErrors(validationErrorsAlertMessages);
    }
    this.setState({
      formValid,
      validationErrorsAlertMessages,
      assignRegistrationErrorsToField,
      errors,
    });
    return formValid;
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
    let { assignRegistrationErrorsToField } = this.state;
    const { validationErrorsAlertMessages } = this.state;
    const { registrationError, submitState } = this.props;
    if (!this.checkNoValidationsErrors(validationErrorsAlertMessages)) {
      assignRegistrationErrorsToField = false;
      errorsObject = validationErrorsAlertMessages;
    } else if (registrationError) {
      if (assignRegistrationErrorsToField && submitState !== PENDING_STATE) {
        this.updateFieldErrors(registrationError);
      }
      errorsObject = registrationError;
    } else {
      return null;
    }
    return (
      <RegistrationFailure
        errors={errorsObject}
        isSubmitted={assignRegistrationErrorsToField}
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
              <p>
                {intl.formatMessage(messages['already.have.an.edx.account'])}
                <Hyperlink className="ml-1" destination={LOGIN_PAGE} onClick={this.handleLoginLinkClickEvent}>
                  {intl.formatMessage(messages['sign.in.hyperlink'])}
                </Hyperlink>
              </p>
              <hr className="mb-3 border-gray-200" />
              <h3 className="mb-3">{intl.formatMessage(messages['create.a.new.account'])}</h3>
              <Form className="form-group">
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['fullname.label'])}
                  for="name"
                  name="name"
                  type="text"
                  invalid={this.state.errors.name !== ''}
                  invalidMessage={this.state.errors.name}
                  value={this.state.name}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.setState({ name: e.target.value })}
                  helpText={intl.formatMessage(messages['helptext.name'])}
                />
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['username.label'])}
                  for="username"
                  name="username"
                  type="text"
                  invalid={this.state.errors.username !== ''}
                  invalidMessage={this.state.errors.username}
                  value={this.state.username}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.setState({ username: e.target.value })}
                  helpText={intl.formatMessage(messages['helptext.username'])}
                />
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['register.page.email.label'])}
                  for="email"
                  name="email"
                  type="text"
                  invalid={this.state.errors.email !== ''}
                  invalidMessage={this.state.errors.email}
                  value={this.state.email}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.setState({ email: e.target.value })}
                  helpText={intl.formatMessage(messages['helptext.email'])}
                />
                {!currentProvider && (
                  <AuthnValidationFormGroup
                    label={intl.formatMessage(messages['password.label'])}
                    for="password"
                    name="password"
                    type="password"
                    invalid={this.state.errors.password !== ''}
                    invalidMessage={this.state.errors.password}
                    value={this.state.password}
                    onBlur={(e) => this.handleOnBlur(e)}
                    onChange={(e) => this.setState({ password: e.target.value })}
                    helpText={intl.formatMessage(messages['helptext.password'])}
                  />
                )}
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['registration.country.label'])}
                  for="country"
                  name="country"
                  type="select"
                  key="country"
                  invalid={this.state.errors.country !== ''}
                  invalidMessage={intl.formatMessage(messages['country.validation.message'])}
                  className="mb-0"
                  value={this.state.country}
                  onBlur={(e) => this.handleOnBlur(e)}
                  onChange={(e) => this.setState({ country: e.target.value })}
                  selectOptions={this.getCountryOptions()}
                />
                <div id="honor-code" className="pt-10 small">
                  <FormattedMessage
                    id="register.page.terms.of.service.and.honor.code"
                    defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                    Member process your personal data in accordance with the {privacyPolicy}."
                    description="Text that appears on registration form stating honor code and privacy policy"
                    values={{
                      platformName: this.state.platformName,
                      tosAndHonorCode: (
                        <Hyperlink destination={getConfig().TOS_AND_HONOR_CODE} rel="noopener" target="_blank">
                          {intl.formatMessage(messages['terms.of.service.and.honor.code'])}
                        </Hyperlink>
                      ),
                      privacyPolicy: (
                        <Hyperlink destination={getConfig().PRIVACY_POLICY} rel="noopener" target="_blank">
                          {intl.formatMessage(messages['privacy.policy'])}
                        </Hyperlink>
                      ),
                    }}
                  />
                </div>
                <AuthnValidationFormGroup
                  label=""
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
                { this.state.enableOptionalField ? this.getOptionalFields() : null}
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

    const params = (new URL(window.location.href)).searchParams;
    const tpaHint = params.get('tpa_hint');

    if (tpaHint) {
      if (thirdPartyAuthApiStatus === PENDING_STATE) {
        return <Skeleton height={36} />;
      }
      const provider = getTpaProvider(tpaHint, providers, secondaryProviders);
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
      fieldName: PropTypes.string,
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
