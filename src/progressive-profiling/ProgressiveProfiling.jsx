import { useEffect, useState } from 'react';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { identifyAuthenticatedUser, sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getLoggingService } from '@edx/frontend-platform/logging';
import {
  Alert,
  Form,
  Hyperlink,
  Spinner,
  StatefulButton,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

import { ProgressiveProfilingProvider, useProgressiveProfilingContext } from './components/ProgressiveProfilingContext';
import messages from './messages';
import ProgressiveProfilingPageModal from './ProgressiveProfilingPageModal';
import BaseContainer from '../base-container';
import { RedirectLogistration } from '../common-components';
import { useSaveUserProfile } from './data/apiHook';
import { ThirdPartyAuthProvider, useThirdPartyAuthContext } from '../common-components/components/ThirdPartyAuthContext';
import { useThirdPartyAuthHook } from '../common-components/data/apiHook';
import {
  COMPLETE_STATE,
  DEFAULT_REDIRECT_URL,
  FAILURE_STATE,
  PENDING_STATE,
} from '../data/constants';
import isOneTrustFunctionalCookieEnabled from '../data/oneTrust';
import { getAllPossibleQueryParams, isHostAvailableInQueryParams } from '../data/utils';
import { FormFieldRenderer } from '../field-renderer';

const ProgressiveProfilingInner = () => {
  const { formatMessage } = useIntl();

  const {
    thirdPartyAuthApiStatus,
    setThirdPartyAuthContextSuccess,
    setThirdPartyAuthContextFailure,
    optionalFields,
  } = useThirdPartyAuthContext();

  const welcomePageContext = optionalFields;
  const {
    submitState,
    showError,
    success,
  } = useProgressiveProfilingContext();

  // Hook for saving user profile
  const saveUserProfileMutation = useSaveUserProfile();

  const location = useLocation();
  const registrationEmbedded = isHostAvailableInQueryParams();

  const queryParams = getAllPossibleQueryParams();
  const authenticatedUser = getAuthenticatedUser() || location.state?.authenticatedUser;
  const functionalCookiesConsent = isOneTrustFunctionalCookieEnabled();
  const enablePostRegistrationRecommendations = (
    getConfig().ENABLE_POST_REGISTRATION_RECOMMENDATIONS && functionalCookiesConsent
  );

  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [formFieldData, setFormFieldData] = useState({ fields: {}, extendedProfile: [] });
  const [values, setValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);

  const { data, isSuccess, error } = useThirdPartyAuthHook({ is_welcome_page: true, next: queryParams?.next });

  useEffect(() => {
    if (registrationEmbedded) {
      if (isSuccess && data) {
        setThirdPartyAuthContextSuccess(
          data.fieldDescriptions,
          data.optionalFields,
          data.thirdPartyAuthContext,
        );
      }
      if (error) {
        setThirdPartyAuthContextFailure();
      }
    } else {
      configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationEmbedded, queryParams?.next]);

  useEffect(() => {
    const registrationResponse = location.state?.registrationResult;
    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
      setFormFieldData({
        fields: location.state?.optionalFields.fields || {},
        extendedProfile: location.state?.optionalFields.extended_profile || [],
      });
    }
  }, [location.state?.registrationResult, location.state?.optionalFields]);

  useEffect(() => {
    if (registrationEmbedded && welcomePageContext && Object.keys(welcomePageContext).includes('fields')) {
      setFormFieldData({
        fields: welcomePageContext.fields,
        extendedProfile: welcomePageContext.extended_profile,
      });
      const nextUrl = welcomePageContext.nextUrl ? welcomePageContext.nextUrl : getConfig().SEARCH_CATALOG_URL;
      setRegistrationResult({ redirectUrl: nextUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationEmbedded, welcomePageContext?.fields,
    welcomePageContext?.extended_profile, welcomePageContext?.nextUrl]);

  useEffect(() => {
    if (authenticatedUser?.userId) {
      identifyAuthenticatedUser(authenticatedUser.userId);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (!enablePostRegistrationRecommendations) {
      sendTrackEvent(
        'edx.bi.user.recommendations.not.enabled',
        { functionalCookiesConsent, page: 'authn_recommendations' },
      );
      return;
    }

    if (registrationResult.redirectUrl && authenticatedUser?.userId) {
      const redirectQueryParams = getAllPossibleQueryParams(registrationResult.redirectUrl);
      if (!('enrollment_action' in redirectQueryParams || queryParams?.next)) {
        setShowRecommendationsPage(true);
      }
    }
  }, [
    authenticatedUser,
    enablePostRegistrationRecommendations,
    functionalCookiesConsent,
    registrationResult.redirectUrl,
    queryParams?.next,
  ]);

  if (
    !authenticatedUser
    || !(location.state?.registrationResult || registrationEmbedded)
    || thirdPartyAuthApiStatus === FAILURE_STATE
    || (thirdPartyAuthApiStatus === COMPLETE_STATE && !Object.keys(welcomePageContext).includes('fields'))
  ) {
    const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    const payload = { ...values, extendedProfile: [] };
    if (Object.keys(formFieldData.extendedProfile).length > 0) {
      formFieldData.extendedProfile.forEach(fieldName => {
        if (values[fieldName]) {
          payload.extendedProfile.push({ fieldName, fieldValue: values[fieldName] });
        }
        delete payload[fieldName];
      });
    }
    saveUserProfileMutation.mutate({ username: authenticatedUser.username, data: snakeCaseObject(payload) });

    sendTrackEvent(
      'edx.bi.welcome.page.submit.clicked',
      {
        isGenderSelected: !!values.gender,
        isYearOfBirthSelected: !!values.year_of_birth,
        isLevelOfEducationSelected: !!values.level_of_education,
        isWorkExperienceSelected: !!values.work_experience,
        host: queryParams?.host || '',
      },
    );
  };

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    setShowModal(true);
    sendTrackEvent(
      'edx.bi.welcome.page.skip.link.clicked',
      {
        host: queryParams?.host || '',
      },
    );
  };

  const onChangeHandler = (e) => {
    if (e.target.type === 'checkbox') {
      setValues({ ...values, [e.target.name]: e.target.checked });
    } else {
      setValues({ ...values, [e.target.name]: e.target.value });
    }
  };

  const formFields = Object.keys(formFieldData.fields).map((fieldName) => {
    const fieldData = formFieldData.fields[fieldName];
    return (
      <span key={fieldData.name}>
        <FormFieldRenderer
          fieldData={fieldData}
          value={values[fieldData.name]}
          onChangeHandler={onChangeHandler}
        />
      </span>
    );
  });

  const shouldRedirect = success;
  return (
    <BaseContainer showWelcomeBanner fullName={authenticatedUser?.fullName || authenticatedUser?.name}>
      <Helmet>
        <title>{formatMessage(messages['progressive.profiling.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <ProgressiveProfilingPageModal isOpen={showModal} redirectUrl={registrationResult.redirectUrl} />
      {(shouldRedirect && welcomePageContext.nextUrl) && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
        />
      )}
      {shouldRedirect && (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
          redirectToRecommendationsPage={showRecommendationsPage}
          educationLevel={values?.level_of_education}
          userId={authenticatedUser?.userId}
        />
      )}
      <div className="mw-xs m-4 pp-page-content">
        {registrationEmbedded && thirdPartyAuthApiStatus === PENDING_STATE ? (
          <Spinner animation="border" variant="primary" id="tpa-spinner" />
        ) : (
          <>
            <div>
              <h2 className="pp-page__heading text-primary">{formatMessage(messages['progressive.profiling.page.heading'])}</h2>
            </div><hr className="border-light-700 mb-4" />
            {showError ? (
              <Alert id="pp-page-errors" className="mb-3" variant="danger" icon={Error}>
                <Alert.Heading>{formatMessage(messages['welcome.page.error.heading'])}</Alert.Heading>
                <p>{formatMessage(messages['welcome.page.error.message'])}</p>
              </Alert>
            ) : null}
            <Form>
              {formFields}
              {(getConfig().AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK) && (
                <span className="pp-page__support-link">
                  <Hyperlink
                    isInline
                    variant="muted"
                    destination={getConfig().AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK}
                    target="_blank"
                    showLaunchIcon={false}
                    onClick={() => (sendTrackEvent('edx.bi.welcome.page.support.link.clicked'))}
                  >
                    {formatMessage(messages['optional.fields.information.link'])}
                  </Hyperlink>
                </span>
              )}
              <div className="d-flex mt-4 mb-3">
                <StatefulButton
                  type="submit"
                  variant="brand"
                  className="pp-page__button-width"
                  state={submitState}
                  labels={{
                    default: showRecommendationsPage ? formatMessage(messages['optional.fields.next.button']) : formatMessage(messages['optional.fields.submit.button']),
                    pending: '',
                  }}
                  onClick={handleSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                />
                <StatefulButton
                  className="text-gray-700 font-weight-500"
                  type="submit"
                  variant="link"
                  labels={{
                    default: formatMessage(messages['optional.fields.skip.button']),
                  }}
                  onClick={handleSkip}
                  onMouseDown={(e) => e.preventDefault()}
                />
              </div>
            </Form>
          </>
        )}

      </div>
    </BaseContainer>
  );
};

const ProgressiveProfiling = (props) => (
  <ThirdPartyAuthProvider>
    <ProgressiveProfilingProvider>
      <ProgressiveProfilingInner {...props} />
    </ProgressiveProfilingProvider>
  </ThirdPartyAuthProvider>
);

export default ProgressiveProfiling;
