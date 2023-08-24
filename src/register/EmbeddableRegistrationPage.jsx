import React, {
  useEffect, useMemo, useState,
} from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import {
  getCountryList, getLocale, useIntl,
} from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import ConfigurableRegistrationForm from './ConfigurableRegistrationForm';
import {
  clearRegistertionBackendError,
  clearUsernameSuggestions,
  fetchRealtimeValidations,
  registerNewUser,
} from './data/actions';
import {
  COUNTRY_CODE_KEY,
  COUNTRY_DISPLAY_KEY,
  FORM_SUBMISSION_ERROR,
} from './data/constants';
import { registrationErrorSelector, validationsSelector } from './data/selectors';
import {
  emailRegex, getSuggestionForInvalidEmail, urlRegex, validateCountryField, validateEmailAddress,
} from './data/utils';
import messages from './messages';
import RegistrationFailure from './RegistrationFailure';
import { EmailField, UsernameField } from './registrationFields';
import {
  FormGroup, PasswordField,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  fieldDescriptionSelector,
} from '../common-components/data/selectors';
import {
  DEFAULT_STATE, LETTER_REGEX, NUMBER_REGEX, REDIRECT, USERNAME_REGEX,
} from '../data/constants';
import {
  getAllPossibleQueryParams, setCookie,
} from '../data/utils';

const EmbeddableRegistrationPage = (props) => {
  const {
    backendCountryCode,
    backendValidations,
    fieldDescriptions,
    registrationError,
    registrationErrorCode,
    registrationResult,
    submitState,
    usernameSuggestions,
    validationApiRateLimited,
    // Actions
    getRegistrationDataFromBackend,
    validateFromBackend,
    clearBackendError,
  } = props;

  const { formatMessage } = useIntl();
  const countryList = useMemo(() => getCountryList(getLocale()), []);
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);
  const { cta, host } = queryParams;
  const flags = {
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };

  const [formFields, setFormFields] = useState({
    email: '',
    name: '',
    password: '',
    username: '',
  });
  const [configurableFormFields, setConfigurableFormFields] = useState({
    marketingEmailsOptIn: true,
  });
  const [errors, setErrors] = useState({
    email: '',
    name: '',
    password: '',
    username: '',
  });
  const [emailSuggestion, setEmailSuggestion] = useState({ suggestion: '', type: '' });
  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);
  const [, setFocusedField] = useState(null);

  const buttonLabel = cta ? formatMessage(messages['create.account.cta.button'], { label: cta }) : formatMessage(messages['create.account.for.free.button']);

  useEffect(() => {
    if (!formStartTime) {
      sendPageEvent('login_and_registration', 'register');
      const payload = { ...queryParams, is_register_page: true };
      getRegistrationDataFromBackend(payload);
      setFormStartTime(Date.now());
    }
  }, [formStartTime, getRegistrationDataFromBackend, queryParams]);

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
    if (backendCountryCode && backendCountryCode !== configurableFormFields?.country?.countryCode) {
      let countryCode = '';
      let countryDisplayValue = '';

      const selectedCountry = countryList.find(
        (country) => (country[COUNTRY_CODE_KEY].toLowerCase() === backendCountryCode.toLowerCase()),
      );
      if (selectedCountry) {
        countryCode = selectedCountry[COUNTRY_CODE_KEY];
        countryDisplayValue = selectedCountry[COUNTRY_DISPLAY_KEY];
      }
      setConfigurableFormFields(prevState => (
        {
          ...prevState,
          country: {
            countryCode, displayValue: countryDisplayValue,
          },
        }
      ));
    }
  }, [backendCountryCode, countryList]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
     * We need to remove the placeholder from the field, adding a space will do that.
     * This is needed because we are placing the username suggestions on top of the field.
     */
  useEffect(() => {
    if (usernameSuggestions.length && !formFields.username) {
      setFormFields(prevState => ({ ...prevState, username: ' ' }));
    }
  }, [usernameSuggestions, formFields]);

  useEffect(() => {
    if (registrationResult.success) {
      // Optimizely registration conversion event
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-registration-conversion',
      });

      // We probably don't need this cookie because this fires the same event as
      // above for optimizely using GTM.
      setCookie(getConfig().REGISTER_CONVERSION_COOKIE_NAME, true);
      // This is used by the "User Retention Rate Event" on GTM
      setCookie('authn-returning-user');

      // Fire GTM event used for integration with impact.com
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'ImpactRegistrationEvent',
      });

      window.parent.postMessage({
        action: REDIRECT,
        redirectUrl: encodeURIComponent(getConfig().POST_REGISTRATION_REDIRECT_URL),
      }, host);
    }
  }, [registrationResult, host]);

  const validateInput = (fieldName, value, payload, shouldValidateFromBackend, shouldSetErrors = true) => {
    let fieldError = '';

    switch (fieldName) {
      case 'name':
        if (value && value.match(urlRegex)) {
          fieldError = formatMessage(messages['name.validation.message']);
        } else if (value && !payload.username.trim() && shouldValidateFromBackend) {
          validateFromBackend(payload);
        }
        break;
      case 'email':
        if (value.length <= 2) {
          fieldError = formatMessage(messages['email.invalid.format.error']);
        } else {
          const [username, domainName] = value.split('@');
          // Check if email address is invalid. If we have a suggestion for invalid email
          // provide that along with the error message.
          if (!emailRegex.test(value)) {
            fieldError = formatMessage(messages['email.invalid.format.error']);
            setEmailSuggestion({
              suggestion: getSuggestionForInvalidEmail(domainName, username),
              type: 'error',
            });
          } else {
            const response = validateEmailAddress(value, username, domainName);
            if (response.hasError) {
              fieldError = formatMessage(messages['email.invalid.format.error']);
              delete response.hasError;
            }
            setEmailSuggestion({ ...response });
          }
        }
        break;
      case 'username':
        if (!value.match(USERNAME_REGEX)) {
          fieldError = formatMessage(messages['username.format.validation.message']);
        }
        break;
      case 'password':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          fieldError = formatMessage(messages['password.validation.message']);
        }
        break;
      case 'country':
        if (flags.showConfigurableEdxFields || flags.showConfigurableRegistrationFields) {
          const {
            countryCode, displayValue, error,
          } = validateCountryField(value.trim(), countryList, formatMessage(messages['empty.country.field.error']));
          fieldError = error;
          setConfigurableFormFields(prevState => ({ ...prevState, country: { countryCode, displayValue } }));
        }
        break;
      default:
        if (flags.showConfigurableRegistrationFields) {
          if (!value && fieldDescriptions[fieldName]?.error_message) {
            fieldError = fieldDescriptions[fieldName].error_message;
          } else if (fieldName === 'confirm_email' && formFields.email && value !== formFields.email) {
            fieldError = formatMessage(messages['email.do.not.match']);
          }
        }
        break;
    }
    if (shouldSetErrors && fieldError) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: fieldError,
      }));
    }
    return fieldError;
  };

  const isFormValid = (payload) => {
    const fieldErrors = { ...errors };
    let isValid = true;
    Object.keys(payload).forEach(key => {
      if (!payload[key]) {
        fieldErrors[key] = formatMessage(messages[`empty.${key}.field.error`]);
      }
      if (fieldErrors[key]) {
        isValid = false;
      }
    });

    if (flags.showConfigurableEdxFields) {
      if (!configurableFormFields.country.displayValue) {
        fieldErrors.country = formatMessage(messages['empty.country.field.error']);
      }
      if (fieldErrors.country) {
        isValid = false;
      }
    }

    if (flags.showConfigurableRegistrationFields) {
      Object.keys(fieldDescriptions).forEach(key => {
        if (key === 'country' && !configurableFormFields.country.displayValue) {
          fieldErrors[key] = formatMessage(messages['empty.country.field.error']);
        } else if (!configurableFormFields[key]) {
          fieldErrors[key] = fieldDescriptions[key].error_message;
        }
        if (fieldErrors[key]) {
          isValid = false;
        }
      });
    }
    setErrors({ ...fieldErrors });
    return isValid;
  };

  const handleSuggestionClick = (event, fieldName, suggestion = '') => {
    event.preventDefault();
    setErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));
    switch (fieldName) {
        case 'email':
          setFormFields(prevState => ({ ...prevState, email: emailSuggestion.suggestion }));
          setEmailSuggestion({ suggestion: '', type: '' });
        break;
        case 'username':
          setFormFields(prevState => ({ ...prevState, username: suggestion }));
          props.resetUsernameSuggestions();
          break;
        default:
          break;
    }
  };

  const handleEmailSuggestionClosed = () => setEmailSuggestion({ suggestion: '', type: '' });

  const handleUsernameSuggestionClosed = () => props.resetUsernameSuggestions();

  const handleOnChange = (event) => {
    const { name } = event.target;
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (registrationError[name]) {
      clearBackendError(name);
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    if (name === 'username') {
      if (value.length > 30) {
        return;
      }
      if (value.startsWith(' ')) {
        value = value.trim();
      }
    }

    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;

    if (name === 'name') {
      validateInput(
        name,
        value,
        { name: formFields.name, username: formFields.username, form_field_key: name },
        !validationApiRateLimited,
        false,
      );
    }
    if (name === 'email') {
      validateInput(name, value, null, !validationApiRateLimited, false);
    }
  };

  const handleOnFocus = (event) => {
    const { name, value } = event.target;
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    clearBackendError(name);
    // Since we are removing the form errors from the focused field, we will
    // need to rerun the validation for focused field on form submission.
    setFocusedField(name);

    if (name === 'username') {
      props.resetUsernameSuggestions();
      // If we added a space character to username field to display the suggestion
      // remove it before user enters the input. This is to ensure user doesn't
      // have a space prefixed to the username.
      if (value === ' ') {
        setFormFields(prevState => ({ ...prevState, [name]: '' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalRegistrationTime = (Date.now() - formStartTime) / 1000;
    let payload = { ...formFields };
    if (!isFormValid(payload)) {
      setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      return;
    }

    Object.keys(configurableFormFields).forEach((fieldName) => {
      if (fieldName === 'country') {
        payload[fieldName] = configurableFormFields[fieldName].countryCode;
      } else {
        payload[fieldName] = configurableFormFields[fieldName];
      }
    });
    // Don't send the marketing email opt-in value if the flag is turned off
    if (!flags.showMarketingEmailOptInCheckbox) {
      delete payload.marketingEmailsOptIn;
    }
    let isValid = true;
    Object.entries(payload).forEach(([key, value]) => {
      if (validateInput(key, value, payload, false, true) !== '') {
        isValid = false;
      }
    });
    if (!isValid) {
      setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      return;
    }
    payload = snakeCaseObject(payload);
    payload.totalRegistrationTime = totalRegistrationTime;

    // add query params to the payload
    payload = { ...payload, ...queryParams };
    props.registerNewUser(payload);
  };

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['register.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <div
        className="mw-xs mt-3 w-100 m-auto pt-4 main-content"
      >
        <RegistrationFailure
          errorCode={errorCode.type}
          failureCount={errorCode.count}
        />
        <Form id="registration-form" name="registration-form">
          <FormGroup
            name="name"
            value={formFields.name}
            handleChange={handleOnChange}
            handleBlur={handleOnBlur}
            handleFocus={handleOnFocus}
            errorMessage={errors.name}
            helpText={[formatMessage(messages['help.text.name'])]}
            floatingLabel={formatMessage(messages['registration.fullname.label'])}
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
            helpText={[formatMessage(messages['help.text.email'])]}
            floatingLabel={formatMessage(messages['registration.email.label'])}
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
            helpText={[formatMessage(messages['help.text.username.1']), formatMessage(messages['help.text.username.2'])]}
            floatingLabel={formatMessage(messages['registration.username.label'])}
          />
          <PasswordField
            name="password"
            value={formFields.password}
            handleChange={handleOnChange}
            handleBlur={handleOnBlur}
            handleFocus={handleOnFocus}
            errorMessage={errors.password}
            floatingLabel={formatMessage(messages['registration.password.label'])}
          />
          <ConfigurableRegistrationForm
            countryList={countryList}
            email={formFields.email}
            fieldErrors={errors}
            registrationEmbedded
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
            className="register-button mt-4 mb-4"
            state={submitState}
            labels={{
              default: buttonLabel,
              pending: '',
            }}
            onClick={handleSubmit}
            onMouseDown={(e) => e.preventDefault()}
          />
        </Form>
      </div>

    </>
  );
};

const mapStateToProps = state => {
  const registerPageState = state.register;
  return {
    backendCountryCode: registerPageState.backendCountryCode,
    backendValidations: validationsSelector(state),
    fieldDescriptions: fieldDescriptionSelector(state),
    registrationError: registerPageState.registrationError,
    registrationErrorCode: registrationErrorSelector(state),
    registrationResult: registerPageState.registrationResult,
    submitState: registerPageState.submitState,
    validationApiRateLimited: registerPageState.validationApiRateLimited,
    usernameSuggestions: registerPageState.usernameSuggestions,
  };
};

EmbeddableRegistrationPage.propTypes = {
  backendCountryCode: PropTypes.string,
  backendValidations: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
  }),
  fieldDescriptions: PropTypes.shape({}),
  registrationError: PropTypes.shape({}),
  registrationErrorCode: PropTypes.string,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  submitState: PropTypes.string,
  usernameSuggestions: PropTypes.arrayOf(PropTypes.string),
  validationApiRateLimited: PropTypes.bool,
  // Actions
  clearBackendError: PropTypes.func.isRequired,
  getRegistrationDataFromBackend: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func.isRequired,
  resetUsernameSuggestions: PropTypes.func.isRequired,
  validateFromBackend: PropTypes.func.isRequired,
};

EmbeddableRegistrationPage.defaultProps = {
  backendCountryCode: '',
  backendValidations: null,
  fieldDescriptions: {},
  registrationError: {},
  registrationErrorCode: '',
  registrationResult: null,
  submitState: DEFAULT_STATE,
  usernameSuggestions: [],
  validationApiRateLimited: false,
};

export default connect(
  mapStateToProps,
  {
    clearBackendError: clearRegistertionBackendError,
    getRegistrationDataFromBackend: getThirdPartyAuthContext,
    resetUsernameSuggestions: clearUsernameSuggestions,
    validateFromBackend: fetchRealtimeValidations,
    registerNewUser,
  },
)(EmbeddableRegistrationPage);
