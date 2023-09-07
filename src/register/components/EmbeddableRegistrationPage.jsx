import React, {
  useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@edx/paragon';
import { Helmet } from 'react-helmet';

import ConfigurableRegistrationForm from './ConfigurableRegistrationForm';
import RegistrationFailure from './RegistrationFailure';
import { PasswordField } from '../../common-components';
import { getThirdPartyAuthContext as getRegistrationDataFromBackend } from '../../common-components/data/actions';
import { REDIRECT } from '../../data/constants';
import { getAllPossibleQueryParams, setCookie } from '../../data/utils';
import { clearRegistrationBackendError, registerNewUser } from '../data/actions';
import { FORM_SUBMISSION_ERROR } from '../data/constants';
import { getBackendValidations, isFormValid, prepareRegistrationPayload } from '../data/utils';
import messages from '../messages';
import { EmailField, NameField, UsernameField } from '../RegistrationFields';

/**
 * Main Registration Page component
 */
const EmbeddableRegistrationPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const flags = {
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };

  const {
    registrationFormData: backedUpFormData,
    registrationError,
    registrationError: {
      errorCode: registrationErrorCode,
    } = {},
    registrationResult,
    submitState,
    validations,
  } = useSelector(state => state.register);

  const { fieldDescriptions } = useSelector(state => state.commonComponents);

  const backendValidations = useMemo(
    () => getBackendValidations(registrationError, validations), [registrationError, validations],
  );
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [configurableFormFields, setConfigurableFormFields] = useState(
    { ...backedUpFormData.configurableFormFields },
  );
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);
  // temporary error state for embedded experience because we don't want to show errors on blur
  const [temporaryErrors, setTemporaryErrors] = useState({ ...backedUpFormData.errors });

  const { cta, host } = queryParams;
  const buttonLabel = cta
    ? formatMessage(messages['create.account.cta.button'], { label: cta })
    : formatMessage(messages['create.account.for.free.button']);

  useEffect(() => {
    if (!formStartTime) {
      sendPageEvent('login_and_registration', 'register');
      const payload = { ...queryParams, is_register_page: true };
      dispatch(getRegistrationDataFromBackend(payload));
      setFormStartTime(Date.now());
    }
  }, [dispatch, formStartTime, queryParams]);

  useEffect(() => {
    if (backendValidations) {
      setTemporaryErrors(prevErrors => ({ ...prevErrors, ...backendValidations }));
    }
  }, [backendValidations]);

  useEffect(() => {
    if (registrationErrorCode) {
      setErrorCode(prevState => ({ type: registrationErrorCode, count: prevState.count + 1 }));
    }
  }, [registrationErrorCode]);

  useEffect(() => {
    if (registrationResult.success) {
      sendTrackEvent('edx.bi.user.account.registered.client', {});

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
  }, [host, registrationResult]);

  const handleOnChange = (event) => {
    const { name } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (registrationError[name]) {
      dispatch(clearRegistrationBackendError(name));
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleErrorChange = (fieldName, error) => {
    setTemporaryErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: error,
    }));
    if (error === '' && errors[fieldName] !== '') {
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: error,
      }));
    }
  };

  const registerUser = () => {
    const totalRegistrationTime = (Date.now() - formStartTime) / 1000;
    let payload = { ...formFields };

    // Validating form data before submitting
    const { isValid, fieldErrors } = isFormValid(
      payload,
      temporaryErrors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage,
    );
    setErrors({ ...fieldErrors });

    // returning if not valid
    if (!isValid) {
      setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      return;
    }

    // Preparing payload for submission
    payload = prepareRegistrationPayload(
      payload,
      configurableFormFields,
      flags.showMarketingEmailOptInCheckbox,
      totalRegistrationTime,
      queryParams);

    // making register call
    dispatch(registerNewUser(payload));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser();
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
          <NameField
            name="name"
            value={formFields.name}
            shouldFetchUsernameSuggestions={!formFields.username.trim()}
            handleChange={handleOnChange}
            handleErrorChange={handleErrorChange}
            errorMessage={errors.name}
            helpText={[formatMessage(messages['help.text.name'])]}
            floatingLabel={formatMessage(messages['registration.fullname.label'])}
          />
          <EmailField
            name="email"
            value={formFields.email}
            confirmEmailValue={configurableFormFields?.confirm_email}
            handleErrorChange={handleErrorChange}
            handleChange={handleOnChange}
            errorMessage={errors.email}
            helpText={[formatMessage(messages['help.text.email'])]}
            floatingLabel={formatMessage(messages['registration.email.label'])}
          />
          <UsernameField
            name="username"
            spellCheck="false"
            value={formFields.username}
            handleChange={handleOnChange}
            handleErrorChange={handleErrorChange}
            errorMessage={errors.username}
            helpText={[formatMessage(messages['help.text.username.1']), formatMessage(messages['help.text.username.2'])]}
            floatingLabel={formatMessage(messages['registration.username.label'])}
          />
          <PasswordField
            name="password"
            value={formFields.password}
            handleChange={handleOnChange}
            handleErrorChange={handleErrorChange}
            errorMessage={errors.password}
            floatingLabel={formatMessage(messages['registration.password.label'])}
          />
          <ConfigurableRegistrationForm
            email={formFields.email}
            fieldErrors={errors}
            formFields={configurableFormFields}
            setFieldErrors={setTemporaryErrors}
            setFormFields={setConfigurableFormFields}
            autoSubmitRegisterForm={false}
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

export default EmbeddableRegistrationPage;
