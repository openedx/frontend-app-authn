import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
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
  Icon,
} from '@edx/paragon';
import { ExpandMore, Error } from '@edx/paragon/icons';

import { saveUserProfile } from './data/actions';
import { welcomePageSelector } from './data/selectors';
import messages from './messages';

import { RedirectLogistration } from '../common-components';
import { DEFAULT_REDIRECT_URL, DEFAULT_STATE } from '../data/constants';
import { EDUCATION_LEVELS, GENDER_OPTIONS, YEAR_OF_BIRTH_OPTIONS } from '../register/data/constants';
import WelcomePageModal from './WelcomePageModal';

const WelcomePage = (props) => {
  const { intl, submitState, showError } = props;

  const [ready, setReady] = useState(false);
  const [registrationResult, setRegistrationResult] = useState({ redirectUrl: '' });
  const [values, setValues] = useState({ levelOfEducation: '', yearOfBirth: '', gender: '' });
  const [openDialog, setOpenDialog] = useState(false);

  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    window.optimizely = window.optimizely || [];
    configureAuth(AxiosJwtAuthService, { loggingService: getLoggingService, config: getConfig() });
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

  if (!props.location.state || !props.location.state.registrationResult) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!ready) {
    return null;
  }

  const getOptions = (fieldName) => {
    const options = {
      yearOfBirth: YEAR_OF_BIRTH_OPTIONS.map(({ value, label }) => (
        <option className="data-hj-suppress" key={value} value={value}>{label}</option>
      )),
      levelOfEducation: EDUCATION_LEVELS.map(key => (
        <option className="data-hj-suppress" key={key} value={key}>
          {intl.formatMessage(messages[`education.levels.${key || 'label'}`])}
        </option>
      )),
      gender: GENDER_OPTIONS.map(key => (
        <option className="data-hj-suppress" key={key} value={key}>
          {intl.formatMessage(messages[`gender.options.${key || 'label'}`])}
        </option>
      )),
    };

    return options[fieldName];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    const authenticatedUser = getAuthenticatedUser();

    ['yearOfBirth', 'gender', 'levelOfEducation'].forEach(fieldName => {
      if (values[fieldName]) {
        payload[fieldName] = values[fieldName];
      }
    });

    props.saveUserProfile(authenticatedUser.username, snakeCaseObject(payload));
    window.optimizely.push({
      type: 'event',
      eventName: 'authn_welcome_page_submit_btn_clicked',
    });
  };

  const handleSkip = (e) => {
    e.preventDefault();
    setOpenDialog(true);

    window.optimizely.push({
      type: 'event',
      eventName: 'authn_welcome_page_skip_btn_clicked',
    });
  };

  const onChangeHandler = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <>
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
      <div className="mw-xs welcome-page-content">
        <div className="welcome-page-heading">
          <h2 className="h3 text-primary">{intl.formatMessage(messages['progressive.profiling.page.heading'])}</h2>
        </div>
        <hr className="border-light-700 mb-4" />
        {showError ? (
          <Alert id="welcome-page-errors" className="mb-3" variant="danger" icon={Error}>
            <Alert.Heading>{intl.formatMessage(messages['welcome.page.error.heading'])}</Alert.Heading>
            <p>{intl.formatMessage(messages['welcome.page.error.message'])}</p>
          </Alert>
        ) : null}
        <Form>
          <Form.Group controlId="levelOfEducation">
            <Form.Control
              as="select"
              name="levelOfEducation"
              value={values.levelOfEducation}
              onChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              floatingLabel={intl.formatMessage(messages['education.levels.label'])}
            >
              {getOptions('levelOfEducation')}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="yearOfBirth">
            <Form.Control
              as="select"
              name="yearOfBirth"
              value={values.yearOfBirth}
              onChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              floatingLabel={intl.formatMessage(messages['year.of.birth.label'])}
            >
              <option value="">{intl.formatMessage(messages['year.of.birth.label'])}</option>
              {getOptions('yearOfBirth')}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="gender" className="mb-3">
            <Form.Control
              as="select"
              name="gender"
              value={values.gender}
              onChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              floatingLabel={intl.formatMessage(messages['gender.options.label'])}
            >
              {getOptions('gender')}
            </Form.Control>
          </Form.Group>
          <span className="progressive-profiling-support">
            <Hyperlink
              isInline
              variant="muted"
              destination={getConfig().WELCOME_PAGE_SUPPORT_LINK}
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages['optional.fields.information.link'])}
            </Hyperlink>
          </span>
          <div className="d-flex mt-4">
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
    </>
  );
};

WelcomePage.propTypes = {
  intl: intlShape.isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),
  saveUserProfile: PropTypes.func.isRequired,
  showError: PropTypes.bool,
  shouldRedirect: PropTypes.bool,
  submitState: PropTypes.string,
};

WelcomePage.defaultProps = {
  location: { state: {} },
  shouldRedirect: false,
  showError: false,
  submitState: DEFAULT_STATE,
};

const mapStateToProps = state => ({
  shouldRedirect: welcomePageSelector(state).success,
  submitState: welcomePageSelector(state).submitState,
  showError: welcomePageSelector(state).showError,
});

export default connect(
  mapStateToProps,
  {
    saveUserProfile,
  },
)(injectIntl(WelcomePage));
