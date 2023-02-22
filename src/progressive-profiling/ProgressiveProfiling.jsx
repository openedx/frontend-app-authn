import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  ensureAuthenticatedUser,
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { injectIntl } from '@edx/frontend-platform/i18n';
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

import BaseComponent from '../base-component';
import { RedirectLogistration } from '../common-components';
import {
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, FAILURE_STATE,
} from '../data/constants';
import { getAllPossibleQueryParams } from '../data/utils';
import FormFieldRenderer from '../field-renderer';
import { saveUserProfile } from './data/actions';
import { welcomePageSelector } from './data/selectors';
import messages from './messages';
import ProgressiveProfilingPageModal from './ProgressiveProfilingPageModal';

const ProgressiveProfiling = (props) => {
  const {
    formRenderState, intl, submitState, showError, location,
  } = props;
  const enablePersonalizedRecommendations = getConfig().ENABLE_PERSONALIZED_RECOMMENDATIONS;
  const registrationResponse = location.state?.registrationResult;
  const [ready, setReady] = useState(false);
  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [values, setValues] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [showRecommendationsPage, setShowRecommendationsPage] = useState(false);

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

    let userEnrollmentAction = false;
    if (registrationResponse) {
      setRegistrationResult(registrationResponse);
      sendPageEvent('login_and_registration', 'welcome');

      const queryParams = getAllPossibleQueryParams(registrationResponse.redirectUrl);
      if ('enrollment_action' in queryParams) {
        userEnrollmentAction = true;
      }
    }

    if (enablePersonalizedRecommendations && !userEnrollmentAction) {
      setShowRecommendationsPage(true);
    }
  }, [DASHBOARD_URL, enablePersonalizedRecommendations, registrationResponse]);

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
    const authenticatedUser = getAuthenticatedUser();
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
    <>
      <BaseComponent showWelcomeBanner>
        <Helmet>
          <title>{intl.formatMessage(messages['progressive.profiling.page.title'],
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
          />
        ) : null}
        <div className="mw-xs pp-page-content">
          <div>
            <h2 className="pp-page-heading text-primary">{intl.formatMessage(messages['progressive.profiling.page.heading'])}</h2>
          </div>
          <hr className="border-light-700 mb-4" />
          {showError ? (
            <Alert id="pp-page-errors" className="mb-3" variant="danger" icon={Error}>
              <Alert.Heading>{intl.formatMessage(messages['welcome.page.error.heading'])}</Alert.Heading>
              <p>{intl.formatMessage(messages['welcome.page.error.message'])}</p>
            </Alert>
          ) : null}
          <Form>
            {formFields}
            <span className="progressive-profiling-support">
              <Hyperlink
                isInline
                variant="muted"
                destination={getConfig().AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK}
                target="_blank"
                showLaunchIcon={false}
                onClick={() => (sendTrackEvent('edx.bi.welcome.page.support.link.clicked'))}
              >
                {intl.formatMessage(messages['optional.fields.information.link'])}
              </Hyperlink>
            </span>
            <div className="d-flex mt-4 mb-3">
              <StatefulButton
                type="submit"
                variant="brand"
                className="login-button-width"
                state={submitState}
                labels={{
                  default: showRecommendationsPage ? intl.formatMessage(messages['optional.fields.next.button']) : intl.formatMessage(messages['optional.fields.submit.button']),
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
                  default: intl.formatMessage(messages['optional.fields.skip.button']),
                }}
                onClick={handleSkip}
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
          </Form>
        </div>
      </BaseComponent>
    </>
  );
};

ProgressiveProfiling.propTypes = {
  formRenderState: PropTypes.string.isRequired,
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
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
)(injectIntl(ProgressiveProfiling));
