import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { identifyAuthenticatedUser, sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  ensureAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getLoggingService } from '@edx/frontend-platform/logging';
import {
  Alert,
  Form,
  Hyperlink,
  StatefulButton,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { saveUserProfile } from './data/actions';
import messages from './messages';
import ProgressiveProfilingPageModal from './ProgressiveProfilingPageModal';
import { BaseComponent } from '../base-component';
import { RedirectLogistration } from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { optionalFieldsSelector } from '../common-components/data/selectors';
import {
  COMPLETE_STATE,
  DEFAULT_REDIRECT_URL,
  DEFAULT_STATE,
  FAILURE_STATE,
  PENDING_STATE,
} from '../data/constants';
import { getAllPossibleQueryParams, isHostAvailableInQueryParams } from '../data/utils';
import { FormFieldRenderer } from '../field-renderer';
import {
  activateRecommendationsExperiment, RECOMMENDATIONS_EXP_VARIATION, trackRecommendationViewedOptimizely,
} from '../recommendations/optimizelyExperiment';
import { trackRecommendationsGroup, trackRecommendationsViewed } from '../recommendations/track';

const ProgressiveProfiling = (props) => {
  const { formatMessage } = useIntl();
  const {
    getFieldDataFromBackend,
    location,
    submitState,
    showError,
    welcomePageContext,
    welcomePageContextApiStatus,
  } = props;
  const registrationEmbedded = isHostAvailableInQueryParams();

  const authenticatedUser = getAuthenticatedUser();
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
  const enablePersonalizedRecommendations = getConfig().ENABLE_PERSONALIZED_RECOMMENDATIONS;

  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [formFieldData, setFormFieldData] = useState({ fields: {}, extendedProfile: [] });
  const [canViewWelcomePage, setCanViewWelcomePage] = useState(false);
  const [values, setValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);

  useEffect(() => {
    configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    ensureAuthenticatedUser(DASHBOARD_URL)
      .then(() => {
        hydrateAuthenticatedUser().then(() => {
          setCanViewWelcomePage(true);
        });
      })
      .catch(() => {});
  }, [DASHBOARD_URL]);

  useEffect(() => {
    const registrationResponse = location.state?.registrationResult;
    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
      setFormFieldData({
        fields: location.state?.optionalFields.fields,
        extendedProfile: location.state?.optionalFields.extended_profile,
      });
    }
  }, [location.state]);

  useEffect(() => {
    if (registrationEmbedded) {
      getFieldDataFromBackend({ is_welcome_page: true });
    }
  }, [registrationEmbedded, getFieldDataFromBackend]);

  useEffect(() => {
    if (registrationEmbedded && Object.keys(welcomePageContext).includes('fields')) {
      setFormFieldData({
        fields: welcomePageContext.fields,
        extendedProfile: welcomePageContext.extended_profile,
      });
      setRegistrationResult({ redirectUrl: getConfig().SEARCH_CATALOG_URL });
    }
  }, [registrationEmbedded, welcomePageContext]);

  useEffect(() => {
    if (canViewWelcomePage && authenticatedUser?.userId) {
      identifyAuthenticatedUser(authenticatedUser.userId);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, [authenticatedUser, canViewWelcomePage]);

  useEffect(() => {
    if (registrationResult.redirectUrl && authenticatedUser?.userId) {
      const redirectQueryParams = getAllPossibleQueryParams(registrationResult.redirectUrl);
      if (enablePersonalizedRecommendations && !('enrollment_action' in redirectQueryParams)) {
        const userIdStr = authenticatedUser.userId.toString();
        const variation = activateRecommendationsExperiment(userIdStr);
        const showRecommendations = variation === RECOMMENDATIONS_EXP_VARIATION;

        trackRecommendationsGroup(variation, authenticatedUser.userId);
        trackRecommendationViewedOptimizely(userIdStr);
        setShowRecommendationsPage(showRecommendations);
        if (!showRecommendations) {
          trackRecommendationsViewed([], true, authenticatedUser.userId);
        }
      }
    }
  }, [authenticatedUser, enablePersonalizedRecommendations, registrationResult]);

  if (
    !(location.state?.registrationResult || registrationEmbedded)
    || welcomePageContextApiStatus === FAILURE_STATE
    || (welcomePageContextApiStatus === COMPLETE_STATE && !Object.keys(welcomePageContext).includes('fields'))
  ) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!canViewWelcomePage) {
    return null;
  }

  const queryParams = getAllPossibleQueryParams();

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
    props.saveUserProfile(authenticatedUser.username, snakeCaseObject(payload));

    sendTrackEvent(
      'edx.bi.welcome.page.submit.clicked',
      {
        isGenderSelected: !!values.gender,
        isYearOfBirthSelected: !!values.year_of_birth,
        isLevelOfEducationSelected: !!values.level_of_education,
        host: queryParams?.host || '',
      },
    );
  };

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(props.location.state, null, '');
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

  return (
    <BaseComponent showWelcomeBanner>
      <Helmet>
        <title>{formatMessage(messages['progressive.profiling.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <ProgressiveProfilingPageModal isOpen={showModal} redirectUrl={registrationResult.redirectUrl} />
      {props.shouldRedirect ? (
        <RedirectLogistration
          success
          redirectUrl={registrationResult.redirectUrl}
          redirectToRecommendationsPage={showRecommendationsPage}
          educationLevel={values?.level_of_education}
          userId={authenticatedUser?.userId}
        />
      ) : null}
      <div className="mw-xs m-4 pp-page-content">
        <div>
          <h2 className="pp-page__heading text-primary">{formatMessage(messages['progressive.profiling.page.heading'])}</h2>
        </div>
        <hr className="border-light-700 mb-4" />
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
      </div>
    </BaseComponent>
  );
};

ProgressiveProfiling.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      registrationResult: PropTypes.shape({
        redirectUrl: PropTypes.string,
      }),
      optionalFields: PropTypes.shape({
        extended_profile: PropTypes.arrayOf(PropTypes.string),
        fields: PropTypes.shape({}),
      }),
    }),
  }),
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
  welcomePageContext: PropTypes.shape({
    extended_profile: PropTypes.arrayOf(PropTypes.string),
    fields: PropTypes.shape({}),
  }),
  welcomePageContextApiStatus: PropTypes.string,
  // Actions
  getFieldDataFromBackend: PropTypes.func.isRequired,
  saveUserProfile: PropTypes.func.isRequired,
};

ProgressiveProfiling.defaultProps = {
  location: { state: {} },
  shouldRedirect: false,
  showError: false,
  submitState: DEFAULT_STATE,
  welcomePageContext: {},
  welcomePageContextApiStatus: PENDING_STATE,
};

const mapStateToProps = state => {
  const welcomePageStore = state.welcomePage;

  return {
    shouldRedirect: welcomePageStore.success,
    showError: welcomePageStore.showError,
    submitState: welcomePageStore.submitState,
    welcomePageContext: optionalFieldsSelector(state),
    welcomePageContextApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
  };
};

export default connect(
  mapStateToProps,
  {
    saveUserProfile,
    getFieldDataFromBackend: getThirdPartyAuthContext,
  },
)(ProgressiveProfiling);
