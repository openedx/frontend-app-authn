import React, {
  useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Spinner, StatefulButton } from '@openedx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';

import ConfigurableRegistrationForm from './components/ConfigurableRegistrationForm';
import RegistrationFailure from './components/RegistrationFailure';
import {
  backupRegistrationFormBegin,
  clearRegistrationBackendError,
  fetchRealtimeValidations,
  registerNewUser,
  setEmailSuggestionInStore,
  setMultiStepRegistrationExpData,
  setUserPipelineDataLoaded,
} from './data/actions';
import {
  FORM_SUBMISSION_ERROR,
  TPA_AUTHENTICATION_FAILURE,
} from './data/constants';
import {
  CONTROL,
  FIRST_STEP,
  getMultiStepRegistrationNextStep,
  getRegisterButtonClassInExperiment,
  getRegisterButtonLabelInExperiment,
  getRegisterButtonSubmitStateInExperiment,
  MULTI_STEP_REGISTRATION_EXP_VARIATION,
  SECOND_STEP,
  shouldDisplayFieldInExperiment, THIRD_STEP,
} from './data/optimizelyExperiment/helper';
import {
  trackMultiStepRegistrationFormSubmitBtnClicked,
  trackMultiStepRegistrationStep1SubmitBtnClicked,
  trackMultiStepRegistrationStep2SubmitBtnClicked,
  trackMultiStepRegistrationStep2Viewed,
  trackMultiStepRegistrationStep3SubmitBtnClicked,
  trackMultiStepRegistrationStep3Viewed,
} from './data/optimizelyExperiment/track';
import useMultiStepRegistrationExperimentVariation
  from './data/optimizelyExperiment/useMultiStepRegistrationExperimentVariation';
import getBackendValidations from './data/selectors';
import {
  isFormValid, prepareRegistrationPayload,
} from './data/utils';
import messages from './messages';
import { EmailField, NameField, UsernameField } from './RegistrationFields';
import {
  InstitutionLogistration,
  PasswordField,
  RedirectLogistration,
  ThirdPartyAuthAlert,
} from '../common-components';
import { getThirdPartyAuthContext as getRegistrationDataFromBackend } from '../common-components/data/actions';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import ThirdPartyAuth from '../common-components/ThirdPartyAuth';
import {
  COMPLETE_STATE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';
import {
  getAllPossibleQueryParams, getTpaHint, getTpaProvider, isHostAvailableInQueryParams, setCookie,
} from '../data/utils';

/**
 * Main Registration Page component
 */
const RegistrationPage = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const registrationEmbedded = isHostAvailableInQueryParams();
  const platformName = getConfig().SITE_NAME;
  const flags = {
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };
  const {
    handleInstitutionLogin,
    institutionLogin,
  } = props;

  const backedUpFormData = useSelector(state => state.register.registrationFormData);
  const registrationError = useSelector(state => state.register.registrationError);
  const registrationErrorCode = registrationError?.errorCode;
  const registrationResult = useSelector(state => state.register.registrationResult);
  const shouldBackupState = useSelector(state => state.register.shouldBackupState);
  const userPipelineDataLoaded = useSelector(state => state.register.userPipelineDataLoaded);
  const submitState = useSelector(state => state.register.submitState);
  const backendValidations = useSelector(getBackendValidations);
  const multiStepRegExpVariation = useSelector(state => state.register.multiStepRegExpVariation);
  const multiStepRegistrationPageStep = useSelector(state => state.register.multiStepRegistrationPageStep);
  const isValidatingMultiStepRegistrationPage = useSelector(
    state => state.register.isValidatingMultiStepRegistrationPage,
  );
  const validationsSubmitState = useSelector(state => state.register.validationsSubmitState);

  const fieldDescriptions = useSelector(state => state.commonComponents.fieldDescriptions);
  const optionalFields = useSelector(state => state.commonComponents.optionalFields);
  const thirdPartyAuthApiStatus = useSelector(state => state.commonComponents.thirdPartyAuthApiStatus);
  const autoSubmitRegForm = useSelector(state => state.commonComponents.thirdPartyAuthContext.autoSubmitRegForm);
  const thirdPartyAuthErrorMessage = useSelector(state => state.commonComponents.thirdPartyAuthContext.errorMessage);
  const finishAuthUrl = useSelector(state => state.commonComponents.thirdPartyAuthContext.finishAuthUrl);
  const currentProvider = useSelector(state => state.commonComponents.thirdPartyAuthContext.currentProvider);
  const providers = useSelector(state => state.commonComponents.thirdPartyAuthContext.providers);
  const secondaryProviders = useSelector(state => state.commonComponents.thirdPartyAuthContext.secondaryProviders);
  const pipelineUserDetails = useSelector(state => state.commonComponents.thirdPartyAuthContext.pipelineUserDetails);

  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);
  const tpaHint = useMemo(() => getTpaHint(), []);

  const [formFields, setFormFields] = useState({ ...backedUpFormData.formFields });
  const [configurableFormFields, setConfigurableFormFields] = useState({ ...backedUpFormData.configurableFormFields });
  const [errors, setErrors] = useState({ ...backedUpFormData.errors });
  const [errorCode, setErrorCode] = useState({ type: '', count: 0 });
  const [formStartTime, setFormStartTime] = useState(null);
  // temporary error state for embedded experience because we don't want to show errors on blur
  const [temporaryErrors, setTemporaryErrors] = useState({ ...backedUpFormData.errors });

  const { cta, host } = queryParams;
  const buttonLabel = cta
    ? formatMessage(messages['create.account.cta.button'], { label: cta })
    : formatMessage(messages['create.account.for.free.button']);

  /**
   * Multi-Step Registration Page Experiment
   */
  const multiStepRegistrationExpVariation = useMultiStepRegistrationExperimentVariation(
    multiStepRegExpVariation, registrationEmbedded, tpaHint, currentProvider, thirdPartyAuthApiStatus,
  );

  useEffect(() => {
    if (isValidatingMultiStepRegistrationPage && backendValidations
        && Object.values(backendValidations).every(value => value === '')
    ) {
      setErrorCode({ type: '', count: 0 });
      const nextStep = getMultiStepRegistrationNextStep(multiStepRegistrationPageStep);
      if (nextStep === SECOND_STEP) {
        const isMarketingLead = formFields.email && configurableFormFields?.marketingEmailsOptIn;
        trackMultiStepRegistrationStep2Viewed(multiStepRegistrationExpVariation, isMarketingLead);
        if (multiStepRegistrationExpVariation === CONTROL) {
          trackMultiStepRegistrationFormSubmitBtnClicked(multiStepRegistrationExpVariation);
        }
      } else if (nextStep === THIRD_STEP) {
        trackMultiStepRegistrationStep3Viewed();
        if (multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION) {
          trackMultiStepRegistrationFormSubmitBtnClicked(multiStepRegistrationExpVariation);
        }
      }
      dispatch(setMultiStepRegistrationExpData(multiStepRegistrationExpVariation, nextStep));
    }
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    isValidatingMultiStepRegistrationPage,
    backendValidations,
  ]);

  /**
   * Set the userPipelineDetails data in formFields for only first time
   */
  useEffect(() => {
    if (!userPipelineDataLoaded && thirdPartyAuthApiStatus === COMPLETE_STATE) {
      if (thirdPartyAuthErrorMessage) {
        setErrorCode(prevState => ({ type: TPA_AUTHENTICATION_FAILURE, count: prevState.count + 1 }));
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
    thirdPartyAuthApiStatus,
    thirdPartyAuthErrorMessage,
    pipelineUserDetails,
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
      dispatch(setMultiStepRegistrationExpData(
        multiStepRegistrationExpVariation, multiStepRegistrationPageStep, false,
      ));
    }
  }, [shouldBackupState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (backendValidations) {
      if (registrationEmbedded) {
        setTemporaryErrors(prevErrors => ({ ...prevErrors, ...backendValidations }));
      } else {
        setErrors(prevErrors => ({ ...prevErrors, ...backendValidations }));
      }
    }
  }, [backendValidations, registrationEmbedded]);

  useEffect(() => {
    if (registrationErrorCode) {
      setErrorCode(prevState => ({ type: registrationErrorCode, count: prevState.count + 1 }));
    }
  }, [registrationErrorCode]);

  useEffect(() => {
    if (registrationResult.success) {
      let registeredEventProps = {};

      if (multiStepRegistrationExpVariation === CONTROL
          || multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION) {
        registeredEventProps = {
          variation: multiStepRegistrationExpVariation,
        };
      }

      // This event is used by GTM
      sendTrackEvent('edx.bi.user.account.registered.client', registeredEventProps);

      // This is used by the "User Retention Rate Event" on GTM
      setCookie(getConfig().USER_RETENTION_COOKIE_NAME, true);
    }
  }, [registrationResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnChange = (event) => {
    const { name } = event.target;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (registrationError[name]) {
      dispatch(clearRegistrationBackendError(name));
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleErrorChange = (fieldName, error) => {
    if (registrationEmbedded) {
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
    } else {
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
    const { isValid, fieldErrors, emailSuggestion } = isFormValid(
      payload,
      registrationEmbedded ? temporaryErrors : errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage,
    );
    setErrors({ ...fieldErrors });
    dispatch(setEmailSuggestionInStore(emailSuggestion));

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

    if (multiStepRegistrationExpVariation === CONTROL
        && multiStepRegistrationPageStep === SECOND_STEP) {
      trackMultiStepRegistrationStep2SubmitBtnClicked(multiStepRegistrationExpVariation);
    }
    if (multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION
        && multiStepRegistrationPageStep === THIRD_STEP) {
      trackMultiStepRegistrationStep3SubmitBtnClicked();
    }
    if (multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION
        && multiStepRegistrationPageStep !== THIRD_STEP) {
      let formFieldsPayload = {};

      if (multiStepRegistrationPageStep === FIRST_STEP) {
        trackMultiStepRegistrationStep1SubmitBtnClicked(multiStepRegistrationExpVariation);
        // We only want to validate email in the first step of registration
        // Doing manual validations to avoid the case where user clicks CTA without focusing out of field.
        formFieldsPayload = { email: formFields.email };
      } else if (multiStepRegistrationPageStep === SECOND_STEP) {
        trackMultiStepRegistrationStep2SubmitBtnClicked(multiStepRegistrationExpVariation);
        // We only want to validate name and password field in the second step of registration
        // Doing manual validations to avoid the case where user clicks CTA without focusing out of field.
        formFieldsPayload = { name: formFields.name, password: formFields.password };
      }

      const { isValid, fieldErrors } = isFormValid(
        formFieldsPayload, errors, {}, {}, formatMessage,
      );
      setErrors(prevErrors => ({
        ...prevErrors,
        ...fieldErrors,
      }));
      // returning if not valid
      if (!isValid) {
        setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      } else {
        dispatch(fetchRealtimeValidations(formFieldsPayload, true));
      }
    } else if (multiStepRegistrationExpVariation === CONTROL && multiStepRegistrationPageStep !== SECOND_STEP) {
      trackMultiStepRegistrationStep1SubmitBtnClicked(multiStepRegistrationExpVariation);
      // We only want to validate name, email and password fields in the first step of CONTROL registration
      // Doing manual validations to avoid the case where user clicks CTA without focusing out of field.
      const formFieldsPayload = { name: formFields.name, email: formFields.email, password: formFields.password };

      const { isValid, fieldErrors } = isFormValid(
        formFieldsPayload, errors, {}, {}, formatMessage,
      );

      setErrors(prevErrors => ({
        ...prevErrors,
        ...fieldErrors,
      }));
      // returning if not valid
      if (!isValid) {
        setErrorCode(prevState => ({ type: FORM_SUBMISSION_ERROR, count: prevState.count + 1 }));
      } else {
        dispatch(fetchRealtimeValidations(formFieldsPayload, true));
      }
    } else {
      registerUser();
    }
  };

  useEffect(() => {
    if (autoSubmitRegForm && userPipelineDataLoaded) {
      registerUser();
    }
  }, [autoSubmitRegForm, userPipelineDataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
          host={host}
          authenticatedUser={registrationResult.authenticatedUser}
          success={registrationResult.success}
          redirectUrl={registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
          optionalFields={optionalFields}
          registrationEmbedded={registrationEmbedded}
          redirectToProgressiveProfilingPage={
            getConfig().ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN && !!Object.keys(optionalFields.fields).length
          }
        />
        {(autoSubmitRegForm && !errorCode.type)
        || (!multiStepRegistrationExpVariation && !(registrationEmbedded || !!tpaHint || !!currentProvider))
          ? (
            <div className="mw-xs mt-5 text-center">
              <Spinner animation="border" variant="primary" id="tpa-spinner" />
            </div>
          ) : (
            <div
              className={classNames(
                'mw-xs mt-3',
                { 'w-100 m-auto pt-4 main-content': registrationEmbedded },
              )}
            >
              <ThirdPartyAuthAlert
                currentProvider={currentProvider}
                platformName={platformName}
                referrer={REGISTER_PAGE}
              />
              <RegistrationFailure
                errorCode={errorCode.type}
                failureCount={errorCode.count}
                context={{ provider: currentProvider, errorMessage: thirdPartyAuthErrorMessage }}
                multiStepRegistrationPageStep={multiStepRegistrationPageStep}
              />
              <Form id="registration-form" name="registration-form">
                {(multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION
                  && multiStepRegistrationPageStep === SECOND_STEP) && (
                  <p className="h3 mb-4">
                    {formatMessage(messages['multistep.registration.username.second.step.guideline.content'])}
                  </p>
                )}
                {((multiStepRegistrationExpVariation === MULTI_STEP_REGISTRATION_EXP_VARIATION
                    && multiStepRegistrationPageStep === THIRD_STEP)
                    || (multiStepRegistrationExpVariation === CONTROL && multiStepRegistrationPageStep === SECOND_STEP))
                    && (
                      <p className="small mb-4">
                        {formatMessage(messages['multistep.registration.username.third.step.guideline.content'])}
                      </p>
                    )}
                {shouldDisplayFieldInExperiment(
                  'name', multiStepRegistrationExpVariation, multiStepRegistrationPageStep,
                ) && (
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
                )}
                {shouldDisplayFieldInExperiment(
                  'email', multiStepRegistrationExpVariation, multiStepRegistrationPageStep,
                ) && (
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
                )}
                {shouldDisplayFieldInExperiment(
                  'username', multiStepRegistrationExpVariation, multiStepRegistrationPageStep,
                ) && (
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
                )}
                {!currentProvider && shouldDisplayFieldInExperiment(
                  'password', multiStepRegistrationExpVariation, multiStepRegistrationPageStep,
                ) && (
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
                  setFieldErrors={registrationEmbedded ? setTemporaryErrors : setErrors}
                  setFormFields={setConfigurableFormFields}
                  autoSubmitRegisterForm={autoSubmitRegForm}
                  fieldDescriptions={fieldDescriptions}
                  multiStepRegistrationExpVariation={multiStepRegistrationExpVariation}
                  multiStepRegistrationPageStep={multiStepRegistrationPageStep}
                />
                <StatefulButton
                  id="register-user"
                  name="register-user"
                  type="submit"
                  variant="brand"
                  className={`
                    mt-4 mb-4 
                    ${getRegisterButtonClassInExperiment(multiStepRegistrationExpVariation, multiStepRegistrationPageStep)}
                  `}
                  state={getRegisterButtonSubmitStateInExperiment(
                    submitState,
                    validationsSubmitState,
                    multiStepRegistrationExpVariation,
                    multiStepRegistrationPageStep,
                  )}
                  labels={{
                    default: getRegisterButtonLabelInExperiment(
                      buttonLabel, multiStepRegistrationExpVariation, multiStepRegistrationPageStep, formatMessage,
                    ),
                    pending: '',
                  }}
                  onClick={handleSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                />
                {(!registrationEmbedded && shouldDisplayFieldInExperiment(
                  'ThirdPartyAuth', multiStepRegistrationExpVariation, multiStepRegistrationPageStep,
                ))
                && (
                  <ThirdPartyAuth
                    currentProvider={currentProvider}
                    providers={providers}
                    secondaryProviders={secondaryProviders}
                    handleInstitutionLogin={handleInstitutionLogin}
                    thirdPartyAuthApiStatus={thirdPartyAuthApiStatus}
                    multiStepRegistrationExpVariation={multiStepRegistrationExpVariation}
                  />
                )}
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
