import React, {
  useEffect, useMemo, useState,
} from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import {
  getCountryList, getLocale, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';

import {
  FormGroup, InstitutionLogistration, PasswordField, RedirectLogistration, ThirdPartyAuthAlert,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  extendedProfileSelector, fieldDescriptionSelector, optionalFieldsSelector, thirdPartyAuthContextSelector,
} from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, INVALID_NAME_REGEX, LETTER_REGEX, NUMBER_REGEX, PENDING_STATE, REGISTER_PAGE, VALID_EMAIL_REGEX,
} from '../data/constants';
import {
  getAllPossibleQueryParams, getTpaHint, getTpaProvider, setCookie, setSurveyCookie,
} from '../data/utils';
import ConfigurableRegistrationForm from './ConfigurableRegistrationForm';
import {
  backupRegistrationFormBegin,
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
  setUserPipelineDataLoaded,
} from './data/actions';
import {
  COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY, FORM_SUBMISSION_ERROR,
} from './data/constants';
import { registrationErrorSelector, validationsSelector } from './data/selectors';
import messages from './messages';
import RegistrationFailure from './RegistrationFailure';
import { EmailField, UsernameField } from './registrationFields';
import ThirdPartyAuth from './ThirdPartyAuth';
import { getSuggestionForInvalidEmail, validateCountryField, validateEmailAddress } from './utils';

const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
const urlRegex = new RegExp(INVALID_NAME_REGEX);

const RegistrationPage = (props) => {
  const {
    backedUpFormData,
    backendCountryCode,
    backendValidations,
    fieldDescriptions,
    handleInstitutionLogin,
    intl,
    institutionLogin,
    optionalFields,
    registrationErrorCode,
    registrationResult,
    shouldBackupState,
    submitState,
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
    usernameSuggestions,
    validationApiRateLimited,
    // Actions
    backupFormState,
    setUserPipelineDetailsLoaded,
    getRegistrationDataFromBackend,
    userPipelineDataLoaded,
    validateFromBackend,
  } = props;

  const countryList = useMemo(() => getCountryList(getLocale()), []);
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);
  const tpaHint = useMemo(() => getTpaHint(), []);
  const flags = { showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS };

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [configurableFormFields, setConfigurableFormFields] = useState({ ...backedUpFormData.configurableFormFields });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const [emailSuggestion, setEmailSuggestion] = useState({ ...backedUpFormData.emailSuggestion });

  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const {
    providers, currentProvider, secondaryProviders, finishAuthUrl,
  } = thirdPartyAuthContext;
  const platformName = getConfig().SITE_NAME;

  /**
   * Set the userPipelineDetails data in formFields for only first time
   */
  useEffect(() => {
    if (!userPipelineDataLoaded) {
      const { pipelineUserDetails } = thirdPartyAuthContext;
      if (pipelineUserDetails && Object.keys(pipelineUserDetails).length !== 0) {
        setFormFields({ ...pipelineUserDetails });
        setUserPipelineDetailsLoaded(true);
      }
    }
  }, [thirdPartyAuthContext, userPipelineDataLoaded, setUserPipelineDetailsLoaded]);

  useEffect(() => {
    if (!formStartTime) {
      sendPageEvent('login_and_registration', 'register');
      const payload = { ...queryParams, is_register_page: true };
      if (tpaHint) {
        payload.tpa_hint = tpaHint;
      }
      getRegistrationDataFromBackend(payload);
      setFormStartTime(Date.now());
    }
  }, [formStartTime, getRegistrationDataFromBackend, queryParams, tpaHint]);

  /**
   * Backup the registration form in redux when register page is toggled.
   */
  useEffect(() => {
    if (shouldBackupState) {
      backupFormState({
        configurableFormFields: { ...configurableFormFields },
        formFields: { ...formFields },
        emailSuggestion: { ...emailSuggestion },
        errors: { ...errors },
      });
    }
  }, [shouldBackupState, configurableFormFields, formFields, errors, emailSuggestion, backupFormState]);

  useEffect(() => {
    if (backendValidations) {
      setErrors(prevErrors => ({ ...prevErrors, ...backendValidations }));
    }
  }, [backendValidations]);

  useEffect(() => {
    if (registrationErrorCode) {
      setErrorCode(prevState => ({ type: registrationErrorCode, count: prevState.count + 1 }));
    }
  }, [registrationErrorCode]);

  useEffect(() => {
    if (backendCountryCode !== '') {
      const selectedCountry = countryList.find(
        (country) => (country[COUNTRY_CODE_KEY].toLowerCase() === backendCountryCode.toLowerCase()),
      );
      if (selectedCountry) {
        setConfigurableFormFields(prevState => (
          {
            ...prevState,
            country: {
              countryCode: selectedCountry[COUNTRY_CODE_KEY], displayValue: selectedCountry[COUNTRY_DISPLAY_KEY]
            },
          }
        ));
      }
    }
  }, [backendCountryCode, countryList]);

  /**
   * We need to remove the placeholder from the field, adding a space will do that.
   * This is needed because we are placing the username suggestions on top of the field.
   */
  useEffect(() => {
    if (usernameSuggestions.length && !formFields.username) {
      setFormFields({ ...formFields, username: ' ' });
    }
  }, [usernameSuggestions, formFields]);

  useEffect(() => {
    if (registrationResult.success) {
      // TODO: Do we still need this cookie?
      setSurveyCookie('register');
      setCookie(getConfig().REGISTER_CONVERSION_COOKIE_NAME, true);
      setCookie('authn-returning-user');

      // Fire optimizely events
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-register-conversion',
      });
    }
  }, [registrationResult]);

  const validateInput = (fieldName, value, payload, shouldValidateFromBackend, setError = true) => {
    let fieldError = '';
    let confirmEmailError = ''; // This is to handle the use case where the form contains "confirm email" field
    let countryFieldCode = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          fieldError = intl.formatMessage(messages['empty.name.field.error']);
        } else if (value && value.match(urlRegex)) {
          fieldError = intl.formatMessage(messages['name.validation.message']);
        } else if (value && !payload.username.trim() && shouldValidateFromBackend) {
          validateFromBackend(payload);
        }
        break;
      case 'email':
        if (!value) {
          fieldError = intl.formatMessage(messages['empty.email.field.error']);
        } else if (value.length <= 2) {
          fieldError = intl.formatMessage(messages['email.invalid.format.error']);
        } else {
          const [username, domainName] = value.split('@');
          // Check if email address is invalid. If we have a suggestion for invalid email
          // provide that along with the error message.
          if (!emailRegex.test(value)) {
            fieldError = intl.formatMessage(messages['email.invalid.format.error']);
            setEmailSuggestion({
              suggestion: getSuggestionForInvalidEmail(domainName, username),
              type: 'error',
            });
          } else {
            const response = validateEmailAddress(value, username, domainName);
            if (response.hasError) {
              fieldError = intl.formatMessage(messages['email.invalid.format.error']);
              delete response.hasError;
            } else if (shouldValidateFromBackend) {
              validateFromBackend(payload);
            }
            setEmailSuggestion({ ...response });

            if (configurableFormFields.confirm_email && value !== configurableFormFields.confirm_email) {
              confirmEmailError = intl.formatMessage(messages['email.do.not.match']);
            }
          }
        }
        break;
      case 'username':
        if (!value || value.length <= 1 || value.length > 30) {
          fieldError = intl.formatMessage(messages['username.validation.message']);
        } else if (!value.match(/^[a-zA-Z0-9_-]*$/i)) {
          fieldError = intl.formatMessage(messages['username.format.validation.message']);
        } else if (shouldValidateFromBackend) {
          validateFromBackend(payload);
        }
        break;
      case 'password':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          fieldError = intl.formatMessage(messages['password.validation.message']);
        } else if (shouldValidateFromBackend) {
          validateFromBackend(payload);
        }
        break;
      case 'country':
        if (flags.showConfigurableEdxFields || flags.showConfigurableRegistrationFields) {
          const { countryCode, displayValue, error } = validateCountryField(
            value.displayValue.trim(), countryList, intl.formatMessage(messages['empty.country.field.error']),
          );
          fieldError = error;
          countryFieldCode = countryCode;
          setConfigurableFormFields({ ...configurableFormFields, country: { countryCode, displayValue } });
        }
        break;
      default:
        if (flags.showConfigurableRegistrationFields) {
          if (!value && fieldDescriptions[fieldName].error_message) {
            fieldError = fieldDescriptions[fieldName].error_message;
          } else if (fieldName === 'confirm_email' && formFields.email && value !== formFields.email) {
            fieldError = intl.formatMessage(messages['email.do.not.match']);
          }
        }
        break;
    }
    if (setError) {
      setErrors({
        ...errors,
        confirm_email: flags.showConfigurableRegistrationFields ? confirmEmailError : '',
        [fieldName]: fieldError,
      });
    }
    return { fieldError, countryFieldCode };
  };

  const isFormValid = (payload, focusedFieldError) => {
    const fieldErrors = { ...errors };
    let isValid = !focusedFieldError;
    Object.keys(payload).forEach(key => {
      if (!payload[key]) {
        fieldErrors[key] = intl.formatMessage(messages[`empty.${key}.field.error`]);
      }
      if (fieldErrors[key]) {
        isValid = false;
      }
    });

    if (flags.showConfigurableEdxFields) {
      if (!configurableFormFields.country.displayValue) {
        fieldErrors.country = intl.formatMessage(messages['empty.country.field.error']);
      }
      if (fieldErrors.country) {
        isValid = false;
      }
    }

    if (flags.showConfigurableRegistrationFields) {
      Object.keys(fieldDescriptions).forEach(key => {
        if (key === 'country' && !configurableFormFields.country.displayValue) {
          fieldErrors[key] = intl.formatMessage(messages['empty.country.field.error']);
        } else if (!configurableFormFields[key]) {
          fieldErrors[key] = fieldDescriptions[key].error_message;
        }
        if (fieldErrors[key]) {
          isValid = false;
        }
      });
    }

    if (focusedField) {
      fieldErrors[focusedField] = focusedFieldError;
    }
    setErrors({ ...fieldErrors });
    return isValid;
  };

  const handleSuggestionClick = (event, fieldName, suggestion = '') => {
    event.preventDefault();
    setErrors({ ...errors, [fieldName]: '' });
    switch (fieldName) {
      case 'email':
        setFormFields({ ...formFields, email: emailSuggestion.suggestion });
        setEmailSuggestion({ suggestion: '', type: '' });
        break;
      case 'username':
        setFormFields({ ...formFields, username: suggestion });
        props.resetUsernameSuggestions();
        break;
      default:
        break;
    }
  };

  const handleEmailSuggestionClosed = () => setEmailSuggestion({ suggestion: '', type: '' });
  const handleUsernameSuggestionClosed = () => props.resetUsernameSuggestions();

  const handleOnChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    if (!(event.target.name === 'username' && value.length > 30)) {
      setFormFields({ ...formFields, [event.target.name]: value });
    }
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    const payload = {
      name: formFields.name,
      email: formFields.email,
      username: formFields.username,
      password: formFields.password,
      form_field_key: name,
    };

    setFocusedField(null);
    validateInput(name, name === 'password' ? formFields.password : value, payload, !validationApiRateLimited);
  };

  const handleOnFocus = (event) => {
    const { name, value } = event.target;
    setErrors({ ...errors, [name]: '' });
    // Since we are removing the form errors from the focused field, we will
    // need to rerun the validation for focused field on form submission.
    setFocusedField(name);

    if (name === 'username') {
      props.resetUsernameSuggestions();
      // If we added a space character to username field to display the suggestion
      // remove it before user enters the input. This is to ensure user doesn't
      // have a space prefixed to the username.
      if (value === ' ') {
        setFormFields({ ...formFields, [name]: '' });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalRegistrationTime = (Date.now() - formStartTime) / 1000;
    let payload = { ...formFields };

    if (currentProvider) {
      delete payload.password;
      payload.social_auth_provider = currentProvider;
    }

    const { focusedFieldError, countryFieldCode } = focusedField ? (
      validateInput(
        focusedField,
        (focusedField in fieldDescriptions || focusedField === 'country') ? (
          configurableFormFields[focusedField]
        ) : formFields[focusedField],
        payload,
        false,
        false,
      )
    ) : '';

    if (!isFormValid(payload, focusedFieldError)) {
      setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      return;
    }

    payload.extendedProfile = [];
    Object.keys(configurableFormFields).forEach((fieldName) => {
      if (props.extendedProfile.includes(fieldName)) {
        payload.extendedProfile.push({ fieldName, fieldValue: configurableFormFields[fieldName] });
      } else if (fieldName === 'country') {
        payload[fieldName] = focusedField === 'country' ? countryFieldCode : configurableFormFields[fieldName].countryCode;
      } else {
        payload[fieldName] = configurableFormFields[fieldName];
      }
    });

    payload = snakeCaseObject(payload);
    payload.totalRegistrationTime = totalRegistrationTime;

    // add query params to the payload
    payload = { ...payload, ...queryParams };
    props.registerNewUser(payload);
  };

  const renderForm = () => {
    if (institutionLogin) {
      return (
        <InstitutionLogistration
          secondaryProviders={secondaryProviders}
          headingTitle={intl.formatMessage(messages['register.institution.login.page.title'])}
        />
      );
    }
    return (
      <>
        <Helmet>
          <title>{intl.formatMessage(messages['register.page.title'], { siteName: getConfig().SITE_NAME })}</title>
        </Helmet>
        <RedirectLogistration
          success={registrationResult.success}
          redirectUrl={registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
          optionalFields={optionalFields}
          redirectToWelcomePage={
            getConfig().ENABLE_PROGRESSIVE_PROFILING && Object.keys(optionalFields).length !== 0
          }
        />
        <div className="mw-xs mt-3">
          <RegistrationFailure
            errorCode={errorCode.type}
            failureCount={errorCode.count}
            context={{ provider: currentProvider }}
          />
          <ThirdPartyAuthAlert
            currentProvider={currentProvider}
            platformName={platformName}
            referrer={REGISTER_PAGE}
          />
          <Form id="registration-form" name="registration-form">
            <FormGroup
              name="name"
              value={formFields.name}
              handleChange={handleOnChange}
              handleBlur={handleOnBlur}
              handleFocus={handleOnFocus}
              errorMessage={errors.name}
              helpText={[intl.formatMessage(messages['help.text.name'])]}
              floatingLabel={intl.formatMessage(messages['registration.fullname.label'])}
            />
            <EmailField
              name="email"
              value={formFields.email}
              handleChange={handleOnChange}
              handleBlur={handleOnBlur}
              handleFocus={handleOnFocus}
              handleSuggestionClick={(e) => handleSuggestionClick(e, 'email')}
              handleOnClose={handleEmailSuggestionClosed}
              emailSuggestion={emailSuggestion}
              errorMessage={errors.email}
              helpText={[intl.formatMessage(messages['help.text.email'])]}
              floatingLabel={intl.formatMessage(messages['registration.email.label'])}
            />
            <UsernameField
              name="username"
              spellCheck="false"
              value={formFields.username}
              handleBlur={handleOnBlur}
              handleChange={handleOnChange}
              handleFocus={handleOnFocus}
              handleSuggestionClick={handleSuggestionClick}
              handleUsernameSuggestionClose={handleUsernameSuggestionClosed}
              usernameSuggestions={usernameSuggestions}
              errorMessage={errors.username}
              helpText={[intl.formatMessage(messages['help.text.username.1']), intl.formatMessage(messages['help.text.username.2'])]}
              floatingLabel={intl.formatMessage(messages['registration.username.label'])}
            />
            {!currentProvider && (
              <PasswordField
                name="password"
                value={formFields.password}
                handleChange={handleOnChange}
                handleBlur={handleOnBlur}
                handleFocus={handleOnFocus}
                errorMessage={errors.password}
                floatingLabel={intl.formatMessage(messages['registration.password.label'])}
              />
            )}
            {(getConfig().MARKETING_EMAILS_OPT_IN)
          && (
            <Form.Checkbox
              name="marketingEmailsOptIn"
              className="opt-checkbox"
              checked={formFields.marketingEmailsOptIn}
              onChange={handleOnChange}
            >
              {intl.formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME })}
            </Form.Checkbox>
          )}
            <ConfigurableRegistrationForm
              countryList={countryList}
              email={formFields.email}
              fieldErrors={errors}
              formFields={configurableFormFields}
              setFieldErrors={setErrors}
              setFormFields={setConfigurableFormFields}
              setFocusedField={setFocusedField}
              fieldDescriptions={fieldDescriptions}
            />
            <StatefulButton
              id="register-user"
              name="register-user"
              type="submit"
              variant="brand"
              className="register-stateful-button-width mt-4 mb-4"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['create.account.for.free.button']),
                pending: '',
              }}
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            <ThirdPartyAuth
              currentProvider={currentProvider}
              providers={providers}
              secondaryProviders={secondaryProviders}
              handleInstitutionLogin={handleInstitutionLogin}
              thirdPartyAuthApiStatus={thirdPartyAuthApiStatus}
            />
          </Form>
        </div>
      </>
    );
  };

  if (tpaHint) {
    if (thirdPartyAuthApiStatus === PENDING_STATE) {
      return <Skeleton height={36} />;
    }
    const { provider, skipHintedLogin } = getTpaProvider(tpaHint, providers, secondaryProviders);
    if (skipHintedLogin) {
      window.location.href = getConfig().LMS_BASE_URL + provider.registerUrl;
      return null;
    }
    return provider ? <EnterpriseSSO provider={provider} intl={intl} /> : renderForm();
  }
  return (
    renderForm()
  );
};

const mapStateToProps = state => {
  const registerPageState = state.register;
  return {
    backedUpFormData: registerPageState.registrationFormData,
    backendCountryCode: registerPageState.backendCountryCode,
    backendValidations: validationsSelector(state),
    fieldDescriptions: fieldDescriptionSelector(state),
    extendedProfile: extendedProfileSelector(state),
    optionalFields: optionalFieldsSelector(state),
    registrationErrorCode: registrationErrorSelector(state),
    registrationResult: registerPageState.registrationResult,
    shouldBackupState: registerPageState.shouldBackupState,
    userPipelineDataLoaded: registerPageState.userPipelineDataLoaded,
    submitState: registerPageState.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    thirdPartyAuthContext: thirdPartyAuthContextSelector(state),
    validationApiRateLimited: registerPageState.validationApiRateLimited,
    usernameSuggestions: registerPageState.usernameSuggestions,
  };
};

RegistrationPage.propTypes = {
  backedUpFormData: PropTypes.shape({
    configurableFormFields: PropTypes.shape({}),
    formFields: PropTypes.shape({}),
    errors: PropTypes.shape({}),
    emailSuggestion: PropTypes.shape({}),
  }),
  backendCountryCode: PropTypes.string,
  backendValidations: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
  }),
  extendedProfile: PropTypes.arrayOf(PropTypes.string),
  fieldDescriptions: PropTypes.shape({}),
  institutionLogin: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  optionalFields: PropTypes.shape({}),
  registrationErrorCode: PropTypes.string,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  shouldBackupState: PropTypes.bool,
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
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
  usernameSuggestions: PropTypes.arrayOf(PropTypes.string),
  userPipelineDataLoaded: PropTypes.bool,
  validationApiRateLimited: PropTypes.bool,
  // Actions
  backupFormState: PropTypes.func.isRequired,
  getRegistrationDataFromBackend: PropTypes.func.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func.isRequired,
  resetUsernameSuggestions: PropTypes.func.isRequired,
  setUserPipelineDetailsLoaded: PropTypes.func.isRequired,
  validateFromBackend: PropTypes.func.isRequired,
};

RegistrationPage.defaultProps = {
  backedUpFormData: {
    configurableFormFields: {},
    formFields: {
      name: '', email: '', username: '', password: '', marketingEmailsOptIn: true,
    },
    errors: {
      name: '', email: '', username: '', password: '',
    },
    emailSuggestion: {
      suggestion: '', type: '',
    },
  },
  backendCountryCode: '',
  backendValidations: null,
  extendedProfile: [],
  fieldDescriptions: {},
  optionalFields: {},
  registrationErrorCode: '',
  registrationResult: null,
  shouldBackupState: false,
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: PENDING_STATE,
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    countryCode: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
  },
  usernameSuggestions: [],
  userPipelineDataLoaded: false,
  validationApiRateLimited: false,
};

export default connect(
  mapStateToProps,
  {
    backupFormState: backupRegistrationFormBegin,
    getRegistrationDataFromBackend: getThirdPartyAuthContext,
    resetUsernameSuggestions: clearUsernameSuggestions,
    validateFromBackend: fetchRealtimeValidations,
    registerNewUser,
    setUserPipelineDetailsLoaded: setUserPipelineDataLoaded,
  },
)(injectIntl(RegistrationPage));
