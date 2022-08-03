import React from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  getCountryList, getLocale, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Alert, Form, Icon, StatefulButton,
} from '@edx/paragon';
import { Close, Error } from '@edx/paragon/icons';
import PropTypes, { string } from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';

import {
  FormGroup, InstitutionLogistration, PasswordField, RedirectLogistration,
  RenderInstitutionButton, SocialAuthProviders, ThirdPartyAuthAlert,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  extendedProfileSelector,
  fieldDescriptionSelector,
  optionalFieldsSelector,
  thirdPartyAuthContextSelector,
} from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, LETTER_REGEX, NUMBER_REGEX, PENDING_STATE, REGISTER_PAGE, VALID_EMAIL_REGEX, VALID_NAME_REGEX,
} from '../data/constants';
import {
  getAllPossibleQueryParam, getTpaHint, getTpaProvider, setCookie, setSurveyCookie,
} from '../data/utils';
import FormFieldRenderer from '../field-renderer';
import CountryDropdown from './CountryDropdown';
import {
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
  resetRegistrationForm,
  setRegistrationFormData,
} from './data/actions';
import {
  COMMON_EMAIL_PROVIDERS, DEFAULT_SERVICE_PROVIDER_DOMAINS, DEFAULT_TOP_LEVEL_DOMAINS, FIELDS, FORM_SUBMISSION_ERROR,
} from './data/constants';
import {
  registrationErrorSelector,
  registrationFormDataSelector,
  registrationRequestSelector,
  usernameSuggestionsSelector,
  validationsSelector,
} from './data/selectors';
import HonorCode from './HonorCode';
import messages from './messages';
import RegistrationFailure from './RegistrationFailure';
import TermsOfService from './TermsOfService';
import UsernameField from './UsernameField';
import { getLevenshteinSuggestion, getSuggestionForInvalidEmail } from './utils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    sendPageEvent('login_and_registration', 'register');
    this.handleOnClose = this.handleOnClose.bind(this);

    this.queryParams = getAllPossibleQueryParam();
    // TODO: Once we have tested it and ready for openedX we can remove this flag and make the code
    // permanent part of Authn and remove extra code
    this.showDynamicRegistrationFields = getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS;
    this.tpaHint = getTpaHint();
    this.isRegistered = true;
    const { registrationFormData } = this.props;
    this.state = {
      country: '',
      email: registrationFormData.email,
      name: registrationFormData.name,
      password: registrationFormData.password,
      username: registrationFormData.username,
      marketingOptIn: registrationFormData.marketingOptIn,
      errors: {
        email: registrationFormData.errors.email,
        name: registrationFormData.errors.name,
        username: registrationFormData.errors.username,
        password: registrationFormData.errors.password,
        country: '',
      },
      emailFieldBorderClass: registrationFormData.emailFieldBorderClass,
      emailErrorSuggestion: registrationFormData.emailErrorSuggestion,
      emailWarningSuggestion: registrationFormData.emailWarningSuggestion,
      errorCode: null,
      failureCount: 0,
      startTime: Date.now(),
      totalRegistrationTime: 0,
      readOnly: true,
      validatePassword: false,
      values: {},
      focusedField: '',
    };
  }

  componentDidMount() {
    const payload = { ...this.queryParams };
    window.optimizely = window.optimizely || [];
    window.optimizely.push({
      type: 'page',
      pageName: 'authn_registration_page',
      isActive: true,
    });

    if (payload.save_for_later === 'true') {
      sendTrackEvent('edx.bi.user.saveforlater.course.enroll.clicked', { category: 'save-for-later' });
    }

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    payload.is_registered = this.isRegistered;
    this.props.resetRegistrationForm();
    this.props.getThirdPartyAuthContext(payload);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.registrationFormData !== nextProps.registrationFormData) {
      if (nextProps.registrationFormData) {
        // do not set focused field's value from redux store to retain entered data in focused field
        const { focusedField } = this.state;
        const { [focusedField]: _, ...registrationData } = nextProps.registrationFormData;
        this.setState({
          ...registrationData,
        });
      }
    }

    if (this.props.usernameSuggestions.length > 0 && this.state.username === '') {
      this.props.setRegistrationFormData({
        username: ' ',
      });
      return false;
    }

    if (this.props.validationDecisions !== nextProps.validationDecisions) {
      if (nextProps.validationDecisions) {
        const state = {};
        const errors = { ...this.state.errors, ...nextProps.validationDecisions };
        let validatePassword = false;

        if (errors.password) {
          validatePassword = true;
        }

        if (nextProps.registrationErrorCode) {
          state.errorCode = nextProps.registrationErrorCode;
        }

        let {
          suggestedTldMessage,
          suggestedTopLevelDomain,
          suggestedSldMessage,
          suggestedServiceLevelDomain,
        } = this.state;

        if (errors.email) {
          suggestedTldMessage = '';
          suggestedTopLevelDomain = '';
          suggestedSldMessage = '';
          suggestedServiceLevelDomain = '';
        }

        this.setState({
          ...state,
          suggestedTldMessage,
          suggestedTopLevelDomain,
          suggestedSldMessage,
          suggestedServiceLevelDomain,
          validatePassword,
        });

        this.props.setRegistrationFormData({
          errors,
        }, true);
      }
      return false;
    }

    if (this.props.thirdPartyAuthContext.pipelineUserDetails !== nextProps.thirdPartyAuthContext.pipelineUserDetails) {
      const { pipelineUserDetails } = nextProps.thirdPartyAuthContext;
      const { registrationFormData } = this.props;

      // Added a conditional errors check to not fall back on pipelines data when a user explicitly edits the form.
      this.props.setRegistrationFormData({
        name: registrationFormData.errors.name ? registrationFormData.name
          : (registrationFormData.name || pipelineUserDetails.name || ''),
        email: registrationFormData.errors.email ? registrationFormData.email
          : (registrationFormData.email || pipelineUserDetails.email || ''),
        username: registrationFormData.errors.username ? registrationFormData.username
          : (registrationFormData.username || pipelineUserDetails.username || ''),
        country: registrationFormData.country || nextProps.thirdPartyAuthContext.countryCode,
      });
      return false;
    }

    if (this.props.thirdPartyAuthContext.countryCode !== nextProps.thirdPartyAuthContext.countryCode) {
      this.props.setRegistrationFormData({
        country: this.props.registrationFormData.country || nextProps.thirdPartyAuthContext.countryCode,
      });
      return false;
    }

    return true;
  }

  onChangeHandler = (e) => {
    const { name, value, checked } = e.target;
    const { errors, values } = this.state;
    if (e.target.type === 'checkbox') {
      errors[name] = '';
      values[name] = checked;
    } else {
      values[name] = value;
    }
    const state = { errors, values };
    this.setState({ ...state });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { startTime } = this.state;
    const totalRegistrationTime = (Date.now() - startTime) / 1000;
    const dynamicFieldErrorMessages = {};

    let payload = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      is_authn_mfe: true,
    };

    if (this.props.thirdPartyAuthContext.currentProvider) {
      payload.social_auth_provider = this.props.thirdPartyAuthContext.currentProvider;
    } else {
      payload.password = this.state.password;
    }

    if (this.showDynamicRegistrationFields) {
      payload.extendedProfile = [];
      Object.keys(this.props.fieldDescriptions).forEach((fieldName) => {
        if (this.props.extendedProfile.includes(fieldName)) {
          payload.extendedProfile.push({ fieldName, fieldValue: this.state.values[fieldName] });
        } else {
          payload[fieldName] = this.state.values[fieldName];
        }
        dynamicFieldErrorMessages[fieldName] = this.props.fieldDescriptions[fieldName].error_message;
      });
      if (
        this.props.fieldDescriptions[FIELDS.HONOR_CODE]
        && this.props.fieldDescriptions[FIELDS.HONOR_CODE].type === 'tos_and_honor_code'
      ) {
        payload[FIELDS.HONOR_CODE] = true;
      }
    } else {
      payload.country = this.state.country;
      payload.honor_code = true;
    }

    if (!this.isFormValid(payload, dynamicFieldErrorMessages)) {
      this.setState(prevState => ({
        errorCode: FORM_SUBMISSION_ERROR,
        failureCount: prevState.failureCount + 1,
      }));
      return;
    }

    if (getConfig().MARKETING_EMAILS_OPT_IN) {
      payload.marketing_emails_opt_in = this.state.marketingOptIn;
    }

    payload = snakeCaseObject(payload);
    payload.totalRegistrationTime = totalRegistrationTime;

    // add query params to the payload
    payload = { ...payload, ...this.queryParams };
    this.setState({
      totalRegistrationTime,
    }, () => {
      this.props.registerNewUser(payload);
    });
  }

  handleOnBlur = (e) => {
    let { name, value } = e.target;
    this.setState({
      focusedField: '',
    });

    if (name === 'passwordValidation') {
      name = 'password';
      value = this.state.password;
    }
    const payload = {
      is_authn_mfe: true,
      form_field_key: name,
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      honor_code: true,
      country: this.state.country,
    };
    this.validateInput(name, value, payload);
  }

  handleOnChange = (e) => {
    if (!(e.target.name === 'username' && e.target.value.length > 30)) {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  }

  handleCountryChange = (value) => {
    // TODO: Remove this function once error message is passed as props from
    // RegistrationPage to CountryDropdown component.
    if (this.props.registrationFormData.errors.country) {
      this.props.setRegistrationFormData({
        country: value,
        errors: {
          ...this.props.registrationFormData.errors,
          country: '',
        },
      });
    } else {
      this.props.setRegistrationFormData({
        country: value,
      });
    }
  }

  handleOnFocus = (e) => {
    const fieldName = e.target.name;
    this.setState({
      focusedField: fieldName,
    });
    const { errors } = this.state;
    errors[fieldName] = '';
    if (fieldName === 'username') {
      this.props.clearUsernameSuggestions();
    }
    if (fieldName === 'country') {
      this.setState({ readOnly: false });
    }
    if (fieldName === 'passwordValidation') {
      errors.password = '';
    }

    this.props.setRegistrationFormData({
      errors,
    });
  }

  handleSuggestionClick = (e, suggestion) => {
    const { errors } = this.state;
    if (e.target.name === 'username') {
      errors.username = '';
      this.props.setRegistrationFormData({
        username: suggestion,
        errors,
      });
      this.props.clearUsernameSuggestions();
    } else if (e.target.name === 'email') {
      e.preventDefault();
      errors.email = '';
      this.props.setRegistrationFormData({
        email: suggestion,
        emailErrorSuggestion: null,
        emailWarningSuggestion: null,
        emailFieldBorderClass: '',
        errors,
      });
    }
  }

  handleUsernameSuggestionClose = () => {
    this.props.setRegistrationFormData({
      username: '',
    });
    this.props.clearUsernameSuggestions();
  }

  validateDynamicFields = (e) => {
    const { intl } = this.props;
    const { errors } = this.state;
    const { name, value } = e.target;
    if (!value) {
      errors[name] = this.props.fieldDescriptions[name].error_message;
    }
    if (name === 'confirm_email' && value.length > 0 && this.state.email && value !== this.state.email) {
      errors.confirm_email = intl.formatMessage(messages['email.do.not.match']);
    }
    this.setState({ errors });
  }

  isFormValid(payload, dynamicFieldError) {
    const { errors } = this.state;
    let isValid = true;
    Object.keys(payload).forEach(key => {
      if (!payload[key]) {
        errors[key] = (key in dynamicFieldError) ? dynamicFieldError[key] : this.props.intl.formatMessage(messages[`empty.${key}.field.error`]);
      }
      // Mark form invalid, if there was already a validation error for this key or we added empty field error
      if (errors[key]) {
        isValid = false;
      }
    });

    const state = { ...payload, errors };
    this.props.setRegistrationFormData({
      ...state,
    });
    return isValid;
  }

  validateInput(fieldName, value, payload) {
    let state = {};
    const { errors } = this.state;
    const { intl, statusCode } = this.props;
    const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
    const urlRegex = new RegExp(VALID_NAME_REGEX);

    switch (fieldName) {
      case 'email':
        if (!value) {
          errors.email = intl.formatMessage(messages['empty.email.field.error']);
        } else if (value.length <= 2) {
          errors.email = intl.formatMessage(messages['email.invalid.format.error']);
        } else {
          let emailWarningSuggestion = null;
          let emailErrorSuggestion = null;

          const [username, domainName] = value.split('@');

          // Check if email address is invalid. If we have a suggestion for invalid email provide that along with
          // error message.
          if (!emailRegex.test(value)) {
            errors.email = intl.formatMessage(messages['email.invalid.format.error']);
            emailErrorSuggestion = getSuggestionForInvalidEmail(domainName, username);
          } else {
            let suggestion = null;
            const hasMultipleSubdomains = value.match(/\./g).length > 1;
            const [serviceLevelDomain, topLevelDomain] = domainName.split('.');
            const tldSuggestion = !DEFAULT_TOP_LEVEL_DOMAINS.includes(topLevelDomain);
            const serviceSuggestion = getLevenshteinSuggestion(serviceLevelDomain, DEFAULT_SERVICE_PROVIDER_DOMAINS, 2);

            if (DEFAULT_SERVICE_PROVIDER_DOMAINS.includes(serviceSuggestion || serviceLevelDomain)) {
              suggestion = `${username}@${serviceSuggestion || serviceLevelDomain}.com`;
            }

            if (!hasMultipleSubdomains && tldSuggestion) {
              emailErrorSuggestion = suggestion;
            } else if (serviceSuggestion) {
              emailWarningSuggestion = suggestion;
            } else {
              suggestion = getLevenshteinSuggestion(domainName, COMMON_EMAIL_PROVIDERS, 3);
              if (suggestion) {
                emailWarningSuggestion = `${username}@${suggestion}`;
              }
            }

            if (!hasMultipleSubdomains && tldSuggestion) {
              errors.email = intl.formatMessage(messages['email.invalid.format.error']);
            } else if (payload && statusCode !== 403) {
              this.props.fetchRealtimeValidations(payload);
            } else {
              errors.email = '';
            }
            if (this.state.values && this.state.values.confirm_email && value !== this.state.values.confirm_email) {
              errors.confirm_email = intl.formatMessage(messages['email.do.not.match']);
            }
          }
          state = {
            emailWarningSuggestion,
            emailErrorSuggestion,
            emailFieldBorderClass: emailWarningSuggestion ? 'yellow-border' : null,
          };
        }
        break;
      case 'name':
        if (!value) {
          errors.name = intl.formatMessage(messages['empty.name.field.error']);
        } else if (value && value.match(urlRegex)) {
          errors.name = intl.formatMessage(messages['name.validation.message']);
        } else {
          errors.name = '';
        }

        if (!this.state.username.trim() && value) {
          // fetch username suggestions based on the full name
          this.props.fetchRealtimeValidations(payload);
        }
        break;
      case 'username':
        if (value === ' ' && this.props.usernameSuggestions.length > 0) {
          errors.username = '';
          break;
        }
        if (!value || value.length <= 1 || value.length > 30) {
          errors.username = intl.formatMessage(messages['username.validation.message']);
        } else if (!value.match(/^[a-zA-Z0-9_-]*$/i)) {
          errors.username = intl.formatMessage(messages['username.format.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.username = '';
        }

        if (this.state.validatePassword) {
          this.props.fetchRealtimeValidations({ ...payload, form_field_key: 'password' });
        }
        break;
      case 'password':
        errors.password = '';
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          errors.password = intl.formatMessage(messages['password.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        }
        break;
      case 'country':
        if (!value) {
          errors.country = intl.formatMessage(messages['empty.country.field.error']);
        } else {
          errors.country = '';
        }
        break;
      default:
        break;
    }

    if (fieldName !== 'country') {
      state = {
        ...state,
        [fieldName]: value,
      };
    }

    this.props.setRegistrationFormData({
      ...state,
      errors,
    });

    return errors;
  }

  handleOnClose() {
    this.props.setRegistrationFormData({
      emailErrorSuggestion: null,
    });
  }

  renderEmailFeedback() {
    if (this.state.emailErrorSuggestion) {
      return (
        <Alert variant="danger" className="email-error-alert" icon={Error}>
          <span className="alert-text">
            {this.props.intl.formatMessage(messages['did.you.mean.alert.text'])}{' '}
            <Alert.Link
              href="#"
              name="email"
              onClick={e => { this.handleSuggestionClick(e, this.state.emailErrorSuggestion); }}
            >
              {this.state.emailErrorSuggestion}
            </Alert.Link>?<Icon src={Close} className="alert-close" onClick={this.handleOnClose} tabIndex="0" />
          </span>
        </Alert>
      );
    }
    if (this.state.emailWarningSuggestion) {
      return (
        <span className="small">
          {this.props.intl.formatMessage(messages['did.you.mean.alert.text'])}:{' '}
          <Alert.Link
            href="#"
            name="email"
            className="email-warning-alert-link"
            onClick={e => { this.handleSuggestionClick(e, this.state.emailWarningSuggestion); }}
          >
            {this.state.emailWarningSuggestion}
          </Alert.Link>?
        </span>
      );
    }

    return null;
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
    const isSocialAuthActive = !!providers.length && !currentProvider;
    const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;

    return (
      <>
        {((isEnterpriseLoginDisabled && isInstitutionAuthActive) || isSocialAuthActive) && (
          <div className="mt-4 mb-3 h4">
            {intl.formatMessage(messages['registration.other.options.heading'])}
          </div>
        )}

        {thirdPartyAuthApiStatus === PENDING_STATE ? (
          <Skeleton className="tpa-skeleton" height={36} count={2} />
        ) : (
          <>
            {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
              <RenderInstitutionButton
                onSubmitHandler={this.props.handleInstitutionLogin}
                buttonTitle={intl.formatMessage(messages['register.institution.login.button'])}
              />
            )}
            {isSocialAuthActive && (
              <div className="row m-0">
                <SocialAuthProviders socialAuthProviders={providers} referrer={REGISTER_PAGE} />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  renderForm(currentProvider,
    providers,
    secondaryProviders,
    thirdPartyAuthApiStatus,
    finishAuthUrl,
    submitState,
    intl) {
    if (this.props.institutionLogin) {
      return (
        <InstitutionLogistration
          secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['register.institution.login.page.title'])}
        />
      );
    }

    if (this.props.registrationResult.success) {
      setSurveyCookie('register');
      setCookie(getConfig().REGISTER_CONVERSION_COOKIE_NAME, true);
      setCookie('authn-returning-user');

      // Fire optimizely events
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-register-conversion',
        tags: {
          value: this.state.totalRegistrationTime,
        },
      });
    }

    const honorCode = [];
    const formFields = this.showDynamicRegistrationFields ? (
      Object.keys(this.props.fieldDescriptions).map((fieldName) => {
        const fieldData = this.props.fieldDescriptions[fieldName];
        switch (fieldData.name) {
          case FIELDS.COUNTRY:
            return (
              <span key={fieldData.name}>
                <CountryDropdown
                  name="country"
                  floatingLabel={intl.formatMessage(messages['registration.country.label'])}
                  options={getCountryList(getLocale())}
                  valueKey="code"
                  displayValueKey="name"
                  value={this.state.values[fieldData.name]}
                  handleBlur={this.handleOnBlur}
                  handleFocus={this.handleOnFocus}
                  errorMessage={intl.formatMessage(messages['empty.country.field.error'])}
                  handleChange={
                    (value) => this.setState(prevState => ({ values: { ...prevState.values, country: value } }))
                  }
                  errorCode={this.state.errorCode}
                  readOnly={this.state.readOnly}
                />
              </span>
            );
          case FIELDS.HONOR_CODE:
            honorCode.push(
              <span key={fieldData.name}>
                <HonorCode
                  fieldType={fieldData.type}
                  value={this.state.values[fieldData.name]}
                  onChangeHandler={this.onChangeHandler}
                  errorMessage={this.state.errors[fieldData.name]}
                />
              </span>,
            );
            return null;
          case FIELDS.TERMS_OF_SERVICE:
            honorCode.push(
              <span key={fieldData.name}>
                <TermsOfService
                  value={this.state.values[fieldData.name]}
                  onChangeHandler={this.onChangeHandler}
                  errorMessage={this.state.errors[fieldData.name]}
                />
              </span>,
            );
            return null;
          default:
            return (
              <span key={fieldData.name}>
                <FormFieldRenderer
                  fieldData={fieldData}
                  value={this.state.values[fieldData.name]}
                  onChangeHandler={this.onChangeHandler}
                  handleBlur={this.validateDynamicFields}
                  handleFocus={this.handleOnFocus}
                  errorMessage={this.state.errors[fieldData.name]}
                  isRequired
                />
              </span>
            );
        }
      })
    ) : null;

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
          optionalFields={this.props.optionalFields}
          redirectToWelcomePage={
            // eslint-disable-next-line no-nested-ternary
            getConfig().ENABLE_PROGRESSIVE_PROFILING
              ? (getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS
                ? Object.keys(this.props.optionalFields).length !== 0 : true
              ) : false
          }
        />
        <div className="mw-xs mt-3">
          {this.state.errorCode ? (
            <RegistrationFailure
              errorCode={this.state.errorCode}
              failureCount={this.state.failureCount}
              context={{ provider: currentProvider }}
            />
          ) : null}
          {currentProvider && (
            <>
              <ThirdPartyAuthAlert
                currentProvider={currentProvider}
                platformName={this.props.thirdPartyAuthContext.platformName}
                referrer={REGISTER_PAGE}
              />
              <h4 className="mt-4 mb-4">{intl.formatMessage(messages['registration.using.tpa.form.heading'])}</h4>
            </>
          )}
          <Form id="registration-form" name="registration-form">
            <FormGroup
              name="name"
              value={this.state.name}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              handleFocus={this.handleOnFocus}
              errorMessage={this.state.errors.name}
              helpText={[intl.formatMessage(messages['help.text.name'])]}
              floatingLabel={intl.formatMessage(messages['registration.fullname.label'])}
            />
            <FormGroup
              name="email"
              value={this.state.email}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.email}
              handleFocus={this.handleOnFocus}
              helpText={[intl.formatMessage(messages['help.text.email'])]}
              floatingLabel={intl.formatMessage(messages['registration.email.label'])}
              borderClass={this.state.emailFieldBorderClass}
            >
              {this.renderEmailFeedback()}
            </FormGroup>

            <UsernameField
              name="username"
              autoComplete="off"
              spellCheck="false"
              value={this.state.username}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              handleFocus={this.handleOnFocus}
              errorMessage={this.state.errors.username}
              helpText={[intl.formatMessage(messages['help.text.username.1']), intl.formatMessage(messages['help.text.username.2'])]}
              floatingLabel={intl.formatMessage(messages['registration.username.label'])}
              handleSuggestionClick={this.handleSuggestionClick}
              usernameSuggestions={this.props.usernameSuggestions}
              handleUsernameSuggestionClose={this.handleUsernameSuggestionClose}
            />

            {!currentProvider && (
              <PasswordField
                name="password"
                value={this.state.password}
                handleBlur={this.handleOnBlur}
                handleChange={this.handleOnChange}
                handleFocus={this.handleOnFocus}
                errorMessage={this.state.errors.password}
                floatingLabel={intl.formatMessage(messages['registration.password.label'])}
              />
            )}
            {!(this.showDynamicRegistrationFields)
            && (
              <CountryDropdown
                name="country"
                floatingLabel={intl.formatMessage(messages['registration.country.label'])}
                options={getCountryList(getLocale())}
                valueKey="code"
                displayValueKey="name"
                value={this.state.country}
                handleBlur={this.handleOnBlur}
                handleFocus={this.handleOnFocus}
                errorMessage={intl.formatMessage(messages['empty.country.field.error'])}
                handleChange={(value) => this.handleCountryChange(value)}
                errorCode={this.state.errorCode}
                readOnly={this.state.readOnly}
              />
            )}
            {formFields}
            {(getConfig().MARKETING_EMAILS_OPT_IN)
            && (
              <Form.Checkbox
                className="opt-checkbox"
                name="marketing_emails_opt_in"
                checked={this.state.marketingOptIn}
                onChange={(e) => this.props.setRegistrationFormData({
                  marketingOptIn: e.target.checked,
                })}
              >
                {intl.formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME })}
              </Form.Checkbox>
            )}
            {!(this.showDynamicRegistrationFields) ? (
              <HonorCode
                fieldType="tos_and_honor_code"
              />
            ) : <div className="mt-4">{honorCode}</div>}
            <StatefulButton
              name="register-user"
              id="register-user"
              type="submit"
              variant="brand"
              className="register-stateful-button-width mt-4 mb-4"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['create.account.for.free.button']),
                pending: '',
              }}
              onClick={this.handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
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
  extendedProfile: [],
  fieldDescriptions: {},
  optionalFields: {},
  registrationResult: null,
  registerNewUser: null,
  registrationErrorCode: null,
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: 'pending',
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    countryCode: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
  },
  registrationFormData: {
    country: '',
    email: '',
    name: '',
    password: '',
    username: '',
    marketingOptIn: true,
    errors: {
      email: '',
      name: '',
      username: '',
      password: '',
      country: '',
    },
    emailFieldBorderClass: '',
    emailErrorSuggestion: null,
    emailWarningSuggestion: null,
  },
  validationDecisions: null,
  statusCode: null,
  usernameSuggestions: [],
};

RegistrationPage.propTypes = {
  extendedProfile: PropTypes.arrayOf(PropTypes.string),
  fieldDescriptions: PropTypes.shape({}),
  optionalFields: PropTypes.shape({}),
  intl: intlShape.isRequired,
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func,
  resetRegistrationForm: PropTypes.func.isRequired,
  setRegistrationFormData: PropTypes.func.isRequired,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  registrationErrorCode: PropTypes.string,
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
  registrationFormData: PropTypes.shape({
    country: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    password: PropTypes.string,
    username: PropTypes.string,
    marketingOptIn: PropTypes.bool,
    errors: PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string,
      password: PropTypes.string,
      country: PropTypes.string,
    }),
    emailFieldBorderClass: PropTypes.string,
    emailErrorSuggestion: PropTypes.string,
    emailWarningSuggestion: PropTypes.string,
  }),
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
    platformName: PropTypes.string,
    providers: PropTypes.array,
    secondaryProviders: PropTypes.array,
    finishAuthUrl: PropTypes.string,
    countryCode: PropTypes.string,
    pipelineUserDetails: PropTypes.shape({
      email: PropTypes.string,
      name: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string,
    }),
  }),
  fetchRealtimeValidations: PropTypes.func.isRequired,
  validationDecisions: PropTypes.shape({
    country: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    password: PropTypes.string,
    username: PropTypes.string,
  }),
  clearUsernameSuggestions: PropTypes.func.isRequired,
  statusCode: PropTypes.number,
  usernameSuggestions: PropTypes.arrayOf(string),
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const registrationResult = registrationRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  return {
    registrationErrorCode: registrationErrorSelector(state),
    submitState: state.register.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    registrationResult,
    thirdPartyAuthContext,
    validationDecisions: validationsSelector(state),
    statusCode: state.register.statusCode,
    usernameSuggestions: usernameSuggestionsSelector(state),
    registrationFormData: registrationFormDataSelector(state),
    fieldDescriptions: fieldDescriptionSelector(state),
    optionalFields: optionalFieldsSelector(state),
    extendedProfile: extendedProfileSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {
    clearUsernameSuggestions,
    getThirdPartyAuthContext,
    fetchRealtimeValidations,
    registerNewUser,
    resetRegistrationForm,
    setRegistrationFormData,
  },
)(injectIntl(RegistrationPage));
