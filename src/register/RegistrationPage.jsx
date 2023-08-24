import React, {
  useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Spinner, StatefulButton } from '@edx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';

import ConfigurableRegistrationForm from './components/ConfigurableRegistrationForm';
import {
  backupRegistrationFormBegin,
  clearRegistertionBackendError,
  registerNewUser,
  setUserPipelineDataLoaded,
} from './data/actions';
import {
  FORM_SUBMISSION_ERROR,
  TPA_AUTHENTICATION_FAILURE,
} from './data/constants';
import { getBackendValidations } from './data/selectors';
import { isFormValid, prepareRegistrationPayload } from './data/utils';
import messages from './messages';
import RegistrationFailure from './components/RegistrationFailure';
import { EmailField, UsernameField } from './RegistrationFields';
import NameField from './RegistrationFields/NameField/NameField';
import ThirdPartyAuth from './components/ThirdPartyAuth';
import {
  InstitutionLogistration, PasswordField, RedirectLogistration, ThirdPartyAuthAlert,
} from '../common-components';
import { getThirdPartyAuthContext as getRegistrationDataFromBackend } from '../common-components/data/actions';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  COMPLETE_STATE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';
import {
  getAllPossibleQueryParams, getTpaHint, getTpaProvider, setCookie,
} from '../data/utils';

const RegistrationPage = (props) => {
  const {
    registrationFormData: backedUpFormData,
    registrationError,
    registrationError: {
      errorCode: registrationErrorCode,
    } = {},
    registrationResult,
    shouldBackupState,
    userPipelineDataLoaded,
    submitState,
    validations,
  } = useSelector(state => state.register);

  const {
    fieldDescriptions,
    optionalFields,
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
  } = useSelector(state => state.commonComponents);

  const {
    handleInstitutionLogin,
    institutionLogin,
  } = props;

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const backendValidations = useMemo(
    () => getBackendValidations(registrationError, validations), [registrationError, validations],
  );
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);
  const tpaHint = useMemo(() => getTpaHint(), []);
  const flags = {
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [configurableFormFields, setConfigurableFormFields] = useState({ ...backedUpFormData.configurableFormFields });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const [autoSubmitRegisterForm, setAutoSubmitRegisterForm] = useState(false);
  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);

  const {
    providers, currentProvider, secondaryProviders, finishAuthUrl,
  } = thirdPartyAuthContext;
  const platformName = getConfig().SITE_NAME;

  /**
   * Set the userPipelineDetails data in formFields for only first time
   */
  useEffect(() => {
    if (!userPipelineDataLoaded && thirdPartyAuthApiStatus === COMPLETE_STATE) {
      const { autoSubmitRegForm, pipelineUserDetails, errorMessage } = thirdPartyAuthContext;
      if (errorMessage) {
        setErrorCode(prevState => ({ type: TPA_AUTHENTICATION_FAILURE, count: prevState.count + 1 }));
      } else if (autoSubmitRegForm) {
        setAutoSubmitRegisterForm(true);
      }
      if (pipelineUserDetails && Object.keys(pipelineUserDetails).length !== 0) {
        const { name = '', username = '', email = '' } = pipelineUserDetails;
        setFormFields(prevState => ({
          ...prevState, name, username, email,
        }));
        dispatch(setUserPipelineDataLoaded(true));
      }
    }
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    thirdPartyAuthContext,
    userPipelineDataLoaded,
  ]);

  useEffect(() => {
    if (!formStartTime) {
      sendPageEvent('login_and_registration', 'register');
      const payload = { ...queryParams, is_register_page: true };
      if (tpaHint) {
        payload.tpa_hint = tpaHint;
      }
      dispatch(getRegistrationDataFromBackend(payload));
      setFormStartTime(Date.now());
    }
  }, [dispatch, formStartTime, queryParams, tpaHint]);

  /**
   * Backup the registration form in redux when register page is toggled.
   */
  useEffect(() => {
    if (shouldBackupState) {
      dispatch(backupRegistrationFormBegin({
        ...backedUpFormData,
        configurableFormFields: { ...configurableFormFields },
        formFields: { ...formFields },
        errors: { ...errors },
      }));
    }
  }, [shouldBackupState, configurableFormFields, formFields, errors, dispatch, backedUpFormData]);

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
    }
  }, [registrationResult]);

  const handleOnChange = (event) => {
    const { name } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (registrationError[name]) {
      dispatch(clearRegistertionBackendError(name));
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleErrorChange = (fieldName, error) => {
    if (fieldName) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: error,
      }));
    }
  };

  const registerUser = () => {
    const totalRegistrationTime = (Date.now() - formStartTime) / 1000;
    let payload = { ...formFields };

    if (currentProvider) {
      delete payload.password;
      payload.social_auth_provider = currentProvider;
    }

    // Validating form data before submitting
    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
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
    console.log('register payload', payload);
    dispatch(registerNewUser(payload));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser();
  };

  useEffect(() => {
    if (autoSubmitRegisterForm && userPipelineDataLoaded) {
      registerUser();
    }
  }, [autoSubmitRegisterForm, userPipelineDataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderForm = () => {
    if (institutionLogin) {
      return (
        <InstitutionLogistration
          secondaryProviders={secondaryProviders}
          headingTitle={formatMessage(messages['register.institution.login.page.title'])}
        />
      );
    }
    return (
      <>
        <Helmet>
          <title>{formatMessage(messages['register.page.title'], { siteName: getConfig().SITE_NAME })}</title>
        </Helmet>
        <RedirectLogistration
          success={registrationResult.success}
          redirectUrl={registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
          optionalFields={optionalFields}
          redirectToProgressiveProfilingPage={
            getConfig().ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN && Object.keys(optionalFields).includes('fields')
          }
        />
        {autoSubmitRegisterForm && !errorCode.type ? (
          <div className="mw-xs mt-5 text-center">
            <Spinner animation="border" variant="primary" id="tpa-spinner" />
          </div>
        ) : (
          <div
            className="mw-xs mt-3"
          >
            <ThirdPartyAuthAlert
              currentProvider={currentProvider}
              platformName={platformName}
              referrer={REGISTER_PAGE}
            />
            <RegistrationFailure
              errorCode={errorCode.type}
              failureCount={errorCode.count}
              context={{ provider: currentProvider, errorMessage: thirdPartyAuthContext.errorMessage }}
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
              {!currentProvider && (
                <PasswordField
                  name="password"
                  value={formFields.password}
                  handleChange={handleOnChange}
                  handleErrorChange={handleErrorChange}
                  errorMessage={errors.password}
                  floatingLabel={formatMessage(messages['registration.password.label'])}
                />
              )}
              <ConfigurableRegistrationForm
                email={formFields.email}
                fieldErrors={errors}
                formFields={configurableFormFields}
                setFieldErrors={setErrors}
                setFormFields={setConfigurableFormFields}
                autoSubmitRegisterForm={autoSubmitRegisterForm}
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
                  default: formatMessage(messages['create.account.for.free.button']),
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
        )}

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
    return provider ? <EnterpriseSSO provider={provider} /> : renderForm();
  }
  return (
    renderForm()
  );
};

RegistrationPage.propTypes = {
  institutionLogin: PropTypes.bool,
  // Actions
  handleInstitutionLogin: PropTypes.func,
};

RegistrationPage.defaultProps = {
  handleInstitutionLogin: null,
  institutionLogin: false,
};

export default RegistrationPage;
