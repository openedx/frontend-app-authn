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

import { BaseComponent } from '../base-component';
import { RedirectLogistration } from '../common-components';
import {
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, FAILURE_STATE,
} from '../data/constants';
import { getAllPossibleQueryParams } from '../data/utils';
import { FormFieldRenderer } from '../field-renderer';
import {
  activateRecommendationsExperiment, RECOMMENDATIONS_EXP_VARIATION, trackRecommendationViewedOptimizely,
} from '../recommendations/optimizelyExperiment';
import { trackRecommendationsGroup, trackRecommendationsViewed } from '../recommendations/track';
import { saveUserProfile } from './data/actions';
import { welcomePageSelector } from './data/selectors';
import messages from './messages';
import ProgressiveProfilingPageModal from './ProgressiveProfilingPageModal';

const ProgressiveProfiling = (props) => {
  const {
    formRenderState, submitState, showError, location,
  } = props;
  const enablePersonalizedRecommendations = getConfig().ENABLE_PERSONALIZED_RECOMMENDATIONS;
  const registrationResponse = location.state?.registrationResult;

  const { formatMessage } = useIntl();
  const [ready, setReady] = useState(false);
  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [values, setValues] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);
  const authenticatedUser = getAuthenticatedUser();
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    ensureAuthenticatedUser(DASHBOARD_URL)
      .then(() => {
        hydrateAuthenticatedUser().then(() => {
          setReady(true);
        });
      })
      .catch(() => {});

    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
    }
  }, [DASHBOARD_URL, registrationResponse]);

  useEffect(() => {
    if (registrationResponse && authenticatedUser?.userId) {
      identifyAuthenticatedUser(authenticatedUser.userId);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, [authenticatedUser, registrationResponse]);

  useEffect(() => {
    if (registrationResponse && authenticatedUser?.userId) {
      const queryParams = getAllPossibleQueryParams(registrationResponse.redirectUrl);
      if (enablePersonalizedRecommendations && !('enrollment_action' in queryParams)) {
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
  }, [authenticatedUser, enablePersonalizedRecommendations, registrationResponse]);

  if (!location.state || !location.state.registrationResult || formRenderState === FAILURE_STATE) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!ready) {
    return null;
  }

  const optionalFields = location.state.optionalFields.fields;
  const extendedProfile = location.state.optionalFields.extended_profile;

  const handleSubmit = (e) => {
    e.preventDefault();
    window.history.replaceState(location.state, null, '');
    const payload = { ...values, extendedProfile: [] };
    if (Object.keys(extendedProfile).length > 0) {
      extendedProfile.forEach(fieldName => {
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
      },
    );
  };

  const handleSkip = (e) => {
    e.preventDefault();
    window.history.replaceState(props.location.state, null, '');
    setOpenDialog(true);
    sendTrackEvent('edx.bi.welcome.page.skip.link.clicked');
  };

  const onChangeHandler = (e) => {
    if (e.target.type === 'checkbox') {
      setValues({ ...values, [e.target.name]: e.target.checked });
    } else {
      setValues({ ...values, [e.target.name]: e.target.value });
    }
  };

  const formFields = Object.keys(optionalFields).map((fieldName) => {
    const fieldData = optionalFields[fieldName];
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
      <ProgressiveProfilingPageModal isOpen={openDialog} redirectUrl={registrationResult.redirectUrl} />
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
          <h2 className="pp-page-heading text-primary">{formatMessage(messages['progressive.profiling.page.heading'])}</h2>
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
            <span className="progressive-profiling-support">
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
              className="login-button-width"
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
  formRenderState: PropTypes.string.isRequired,
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
  saveUserProfile: PropTypes.func.isRequired,
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
};

ProgressiveProfiling.defaultProps = {
  location: { state: {} },
  shouldRedirect: false,
  showError: false,
  submitState: DEFAULT_STATE,
};

const mapStateToProps = state => ({
  formRenderState: welcomePageSelector(state).formRenderState,
  shouldRedirect: welcomePageSelector(state).success,
  submitState: welcomePageSelector(state).submitState,
  showError: welcomePageSelector(state).showError,
});

export default connect(
  mapStateToProps,
  {
    saveUserProfile,
  },
)(ProgressiveProfiling);
