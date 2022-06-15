import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  configure as configureAuth,
  AxiosJwtAuthService,
  ensureAuthenticatedUser,
  hydrateAuthenticatedUser,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getLoggingService } from '@edx/frontend-platform/logging';
import {
  Alert,
  Form,
  StatefulButton,
  Hyperlink,
} from '@edx/paragon';
import { Error } from '@edx/paragon/icons';

import { saveUserProfile } from './data/actions';
import { welcomePageSelector } from './data/selectors';
import messages from './messages';

import { RedirectLogistration } from '../common-components';
import {
  DEFAULT_REDIRECT_URL, DEFAULT_STATE, FAILURE_STATE,
} from '../data/constants';
import FormFieldRenderer from '../field-renderer';
import WelcomePageModal from './WelcomePageModal';
import BaseComponent from '../base-component';

const ProgressiveProfiling = (props) => {
  const {
    formRenderState, intl, submitState, showError,
  } = props;
  const optionalFields = props.location.state.optionalFields.fields;
  const extendedProfile = props.location.state.optionalFields.extended_profile;
  const [ready, setReady] = useState(false);
  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [values, setValues] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService(), config: getConfig() });
    ensureAuthenticatedUser(DASHBOARD_URL).then(() => {
      hydrateAuthenticatedUser().then(() => {
        setReady(true);
      });
    });

    if (props.location.state && props.location.state.registrationResult) {
      setRegistrationResult(props.location.state.registrationResult);
      sendPageEvent('login_and_registration', 'welcome');
    }
  }, []);

  if (!props.location.state || !props.location.state.registrationResult || formRenderState === FAILURE_STATE) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!ready) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const authenticatedUser = getAuthenticatedUser();
    const payload = { ...values, extendedProfile: [] };
    extendedProfile.forEach(fieldName => {
      if (values[fieldName]) {
        payload.extendedProfile.push({ fieldName, fieldValue: values[fieldName] });
      }
      delete payload[fieldName];
    });
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
        <WelcomePageModal isOpen={openDialog} redirectUrl={registrationResult.redirectUrl} />
        {props.shouldRedirect ? (
          <RedirectLogistration
            success
            redirectUrl={registrationResult.redirectUrl}
          />
        ) : null}
        <div className="mw-xs pp-page-content">
          <div className="pp-page-heading">
            <h2 className="h3 text-primary">{intl.formatMessage(messages['progressive.profiling.page.heading'])}</h2>
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
                destination={getConfig().WELCOME_PAGE_SUPPORT_LINK}
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
                  default: intl.formatMessage(messages['optional.fields.submit.button']),
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
  // eslint-disable-next-line react/no-unused-prop-types
  extendedProfile: PropTypes.arrayOf(PropTypes.string),
  optionalFields: PropTypes.shape({}),
  formRenderState: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),
  saveUserProfile: PropTypes.func.isRequired,
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
};

ProgressiveProfiling.defaultProps = {
  extendedProfile: [],
  optionalFields: {},
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
