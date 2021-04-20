import React from 'react';

import snakeCase from 'lodash.snakecase';
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
import {
  Form, Hyperlink, Icon, StatefulButton,
} from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { registerNewUser, fetchRealtimeValidations } from './data/actions';
import { registrationRequestSelector, validationsSelector } from './data/selectors';
import messages from './messages';
import OptionalFields from './OptionalFields';
import RegistrationFailure from './RegistrationFailure';

import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration, FormGroup, PasswordField,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';
import {
  getTpaProvider, getTpaHint, getAllPossibleQueryParam,
} from '../data/utils';
import UsernameField from './UsernameField';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    sendPageEvent('login_and_registration', 'register');
    this.intl = props.intl;
    this.queryParams = getAllPossibleQueryParam();
    this.tpaHint = getTpaHint();

    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS ? getConfig().REGISTRATION_OPTIONAL_FIELDS.split(',') : [];

    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      country: '',
      showOptionalField: false,
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
      optionalFields,
      optionalFieldsState: {},
      startTime: Date.now(),
      updateFieldErrors: false,
      updateAlertErrors: false,
      registrationErrorsUpdated: false,
      fieldName: '',
    };
  }

  componentDidMount() {
    const payload = { ...this.queryParams };

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.getThirdPartyAuthContext(payload);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.statusCode !== 403 && this.props.validations !== nextProps.validations) {
      const { errors, fieldName } = this.state;
      errors[fieldName] = nextProps.validations.validation_decisions[fieldName];

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

  getCountryOptions = () => [
    { code: '', name: this.props.intl.formatMessage(messages['registration.country.label']) },
  ].concat(getCountryList(getLocale())).map(({ code, name }) => (
    <option className="data-hj-suppress" key={code} value={code}>{name}</option>
  ));

  getOptionalFields() {
    return (
      <OptionalFields
        optionalFields={this.state.optionalFields}
        values={this.state.optionalFieldsState}
        onChangeHandler={
          (fieldName, value) => {
            this.setState(prevState => ({
              optionalFieldsState: { ...prevState.optionalFieldsState, [fieldName]: value },
            }));
          }
        }
      />
    );
  }

  handleInstitutionLogin = () => {
    this.setState(prevState => ({ institutionLogin: !prevState.institutionLogin }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const totalRegistrationTime = (Date.now() - this.state.startTime) / 1000;
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
    this.state.optionalFields.forEach((key) => {
      if (this.state.optionalFieldsState[key]) {
        payload[snakeCase(key)] = this.state.optionalFieldsState[key];
      }
    });
    if (finalValidation) {
      payload.totalRegistrationTime = totalRegistrationTime;
      this.props.registerNewUser(payload);
    }
  }

  handleOnBlur = (e) => {
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
      fieldName: e.target.name,
      updateFieldErrors: false,
      updateAlertErrors: false,
    }, () => {
      this.validateInput(name, value, payload, false);
    });
  }

  handleOnChange = (e) => {
    if (e.target.name === 'optionalFields') {
      this.setState({
        showOptionalField: e.target.checked,
        updateAlertErrors: false,
        updateFieldErrors: false,
      });
      sendTrackEvent('edx.bi.user.register.optional_fields_selected', {});
    } else if (!(e.target.name === 'username' && e.target.value.length > 30)) {
      this.setState({
        [e.target.name]: e.target.value,
        updateFieldErrors: false,
        updateAlertErrors: false,
      });
    }
  }

  handleSuggestionClick = (suggestion) => {
    const fieldName = 'username';
    const payload = {
      username: suggestion,
    };
    this.setState({
      ...payload,
      fieldName,
      updateFieldErrors: false,
      updateAlertErrors: false,
    }, () => {
      this.validateInput(fieldName, suggestion, payload, false);
    });
  }

  checkNoAlertErrors(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => {
      const validation = validations[key][0];
      return !validation.user_message;
    });
    return keyValidList.every((current) => current === true);
  }

  checkNoFieldErrors(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => !validations[key]);
    return keyValidList.every((current) => current === true);
  }

  validateInput(inputName, value, payload, updateAlertMessage = true) {
    const {
      errors,
    } = this.state;
    const {
      intl,
      statusCode,
    } = this.props;

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
        } else if (!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
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
        />
        <div className="mw-xs mt-3">
          {this.renderErrors()}
          {currentProvider && (
            <ThirdPartyAuthAlert
              currentProvider={currentProvider}
              platformName={this.props.thirdPartyAuthContext.platformName}
              referrer={REGISTER_PAGE}
            />
          )}
          <Form>
            <FormGroup
              name="name"
              value={this.state.name}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.name}
              floatingLabel={intl.formatMessage(messages['registration.fullname.label'])}
            />
            <UsernameField
              name="username"
              value={this.state.username}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.username}
              helpText={[intl.formatMessage(messages['help.text.username.1']), intl.formatMessage(messages['help.text.username.2'])]}
              floatingLabel={intl.formatMessage(messages['registration.username.label'])}
              handleSuggestionClick={this.handleSuggestionClick}
            />
            <FormGroup
              name="email"
              value={this.state.email}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.email}
              helpText={[intl.formatMessage(messages['help.text.email'])]}
              floatingLabel={intl.formatMessage(messages['registration.email.label'])}
            />
            {!currentProvider && (
              <PasswordField
                name="password"
                value={this.state.password}
                handleBlur={this.handleOnBlur}
                handleChange={this.handleOnChange}
                errorMessage={this.state.errors.password}
                floatingLabel={intl.formatMessage(messages['registration.password.label'])}
              />
            )}
            <FormGroup
              as="select"
              name="country"
              value={this.state.country}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.country}
              floatingLabel={intl.formatMessage(messages['registration.country.label'])}
              trailingElement={<Icon src={ExpandMore} />}
              options={this.getCountryOptions}
            />
            <div id="honor-code" className="small">
              <FormattedMessage
                id="register.page.terms.of.service.and.honor.code"
                defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                Member process your personal data in accordance with the {privacyPolicy}."
                description="Text that appears on registration form stating honor code and privacy policy"
                values={{
                  platformName: this.state.platformName,
                  tosAndHonorCode: (
                    <Hyperlink destination={getConfig().TOS_AND_HONOR_CODE || '#'} target="_blank">
                      {intl.formatMessage(messages['terms.of.service.and.honor.code'])}
                    </Hyperlink>
                  ),
                  privacyPolicy: (
                    <Hyperlink destination={getConfig().PRIVACY_POLICY || '#'} target="_blank">
                      {intl.formatMessage(messages['privacy.policy'])}
                    </Hyperlink>
                  ),
                }}
              />
            </div>
            {this.state.optionalFields.length ? (
              <Form.Group className="mb-0 mt-2 small">
                <Form.Check
                  id="optional-field-checkbox"
                  type="checkbox"
                  name="optionalFields"
                  value={this.state.showOptionalField}
                  onClick={this.handleOnChange}
                  onChange={this.handleOnChange}
                  label={intl.formatMessage(messages['support.education.research'])}
                />
              </Form.Group>
            ) : null}
            { this.state.showOptionalField ? this.getOptionalFields() : null }
            <StatefulButton
              type="submit"
              variant="brand"
              className="register-button-width mt-4"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['create.account.button']),
                pending: '',
              }}
              icons={{
                pending: (
                  <FontAwesomeIcon icon={faSpinner} spin>
                    <span className="sr-only">{intl.formatMessage(messages['create.an.account.btn.pending.state'])}</span>
                  </FontAwesomeIcon>
                ),
              }}
              onClick={this.handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            {(providers.length || secondaryProviders.length || thirdPartyAuthApiStatus === PENDING_STATE)
              && !currentProvider ? (
                <div className="mt-4 mb-3 h4">
                  {intl.formatMessage(messages['registration.other.options.heading'])}
                </div>
              ) : null}
            {this.renderThirdPartyAuth(providers,
              secondaryProviders,
              currentProvider,
              thirdPartyAuthApiStatus,
              intl)}
          </Form>
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
      const { provider, isSecondaryProvider } = getTpaProvider(this.tpaHint, providers, secondaryProviders);
      if (isSecondaryProvider) {
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
    validations: validationsSelector(state),
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
