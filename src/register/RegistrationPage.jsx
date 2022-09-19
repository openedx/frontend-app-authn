import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { FormGroup, PasswordField, RedirectLogistration } from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import {
  extendedProfileSelector, fieldDescriptionSelector, optionalFieldsSelector,
} from '../common-components/data/selectors';
import {
  DEFAULT_STATE, INVALID_NAME_REGEX, LETTER_REGEX, NUMBER_REGEX, VALID_EMAIL_REGEX,
} from '../data/constants';
import { getAllPossibleQueryParams, setCookie, setSurveyCookie } from '../data/utils';
import ConfigurableRegistrationForm from './ConfigurableRegistrationForm';
import {
  backupRegistrationFormBegin, clearUsernameSuggestions, fetchRealtimeValidations, registerNewUser,
} from './data/actions';
import { FORM_SUBMISSION_ERROR } from './data/constants';
import { registrationErrorSelector, validationsSelector } from './data/selectors';
import messages from './messages';
import RegistrationFailure from './RegistrationFailure';
import { EmailField, UsernameField } from './registrationFields';
import { getSuggestionForInvalidEmail, validateEmailAddress } from './utils';

const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
const urlRegex = new RegExp(INVALID_NAME_REGEX);

const RegistrationPage = (props) => {
  const {
    backedUpFormData,
    backendValidations,
    fieldDescriptions,
    intl,
    registrationErrorCode,
    registrationResult,
    shouldBackupState,
    submitState,
    usernameSuggestions,
    validationApiRateLimited,
    // Actions
    backupFormState,
    getRegistrationDataFromBackend,
    validateFromBackend,
  } = props;

  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);
  const flags = useMemo(() => ({
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
  }), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [configurableFormFields, setConfigurableFormFields] = useState({ ...backedUpFormData.configurableFormFields });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const [emailSuggestion, setEmailSuggestion] = useState({ ...backedUpFormData.emailSuggestion });

  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!formStartTime) {
      sendPageEvent('login_and_registration', 'register');
      getRegistrationDataFromBackend({ ...queryParams, is_register_page: true });
      setFormStartTime(Date.now());
    }
  }, [formStartTime, getRegistrationDataFromBackend, queryParams]);

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
    return fieldError;
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

    if (flags.showConfigurableRegistrationFields) {
      Object.keys(fieldDescriptions).forEach(key => {
        if (!configurableFormFields[key]) {
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

    const fieldError = focusedField ? (
      validateInput(
        focusedField,
        focusedField in fieldDescriptions ? configurableFormFields[focusedField] : formFields[focusedField],
        payload,
        false,
        false,
      )
    ) : '';

    if (!isFormValid(payload, fieldError)) {
      setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      return;
    }

    payload.extendedProfile = [];
    Object.keys(configurableFormFields).forEach((fieldName) => {
      if (props.extendedProfile.includes(fieldName)) {
        payload.extendedProfile.push({ fieldName, fieldValue: configurableFormFields[fieldName] });
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

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage(messages['register.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <RedirectLogistration
        success={registrationResult.success}
        redirectUrl={registrationResult.redirectUrl}
        finishAuthUrl="" // TODO: Add finish auth url during the TPA auth work
        optionalFields={props.optionalFields}
        redirectToWelcomePage={
          getConfig().ENABLE_PROGRESSIVE_PROFILING && Object.keys(props.optionalFields).length !== 0
        }
      />
      <div className="mw-xs mt-3">
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
          <PasswordField
            name="password"
            value={formFields.password}
            handleChange={handleOnChange}
            handleBlur={handleOnBlur}
            handleFocus={handleOnFocus}
            errorMessage={errors.password}
            floatingLabel={intl.formatMessage(messages['registration.password.label'])}
          />
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
        </Form>
      </div>
    </>
  );
};

const mapStateToProps = state => {
  const registerPageState = state.register;
  return {
    backedUpFormData: registerPageState.registrationFormData,
    backendValidations: validationsSelector(state),
    fieldDescriptions: fieldDescriptionSelector(state),
    extendedProfile: extendedProfileSelector(state),
    optionalFields: optionalFieldsSelector(state),
    registrationErrorCode: registrationErrorSelector(state),
    registrationResult: registerPageState.registrationResult,
    shouldBackupState: registerPageState.shouldBackupState,
    submitState: registerPageState.submitState,
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
  backendValidations: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
  }),
  extendedProfile: PropTypes.arrayOf(PropTypes.string),
  fieldDescriptions: PropTypes.shape({}),
  intl: intlShape.isRequired,
  optionalFields: PropTypes.shape({}),
  registrationErrorCode: PropTypes.string,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  shouldBackupState: PropTypes.bool,
  submitState: PropTypes.string,
  validationApiRateLimited: PropTypes.bool,
  usernameSuggestions: PropTypes.arrayOf(PropTypes.string),
  // Actions
  backupFormState: PropTypes.func.isRequired,
  getRegistrationDataFromBackend: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func.isRequired,
  resetUsernameSuggestions: PropTypes.func.isRequired,
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
  backendValidations: null,
  extendedProfile: [],
  fieldDescriptions: {},
  optionalFields: {},
  registrationErrorCode: '',
  registrationResult: null,
  shouldBackupState: false,
  submitState: DEFAULT_STATE,
  validationApiRateLimited: false,
  usernameSuggestions: [],
};

export default connect(
  mapStateToProps,
  {
    backupFormState: backupRegistrationFormBegin,
    getRegistrationDataFromBackend: getThirdPartyAuthContext,
    resetUsernameSuggestions: clearUsernameSuggestions,
    validateFromBackend: fetchRealtimeValidations,
    registerNewUser,
  },
)(injectIntl(RegistrationPage));
