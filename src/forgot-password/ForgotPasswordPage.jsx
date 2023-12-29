import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Hyperlink,
  Icon,
  StatefulButton,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import { forgotPassword, setForgotPasswordFormData } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import ForgotPasswordAlert from './ForgotPasswordAlert';
import messages from './messages';
import BaseContainer from '../base-container';
import { FormGroup } from '../common-components';
import { DEFAULT_STATE, LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';

const ForgotPasswordPage = (props) => {
  const platformName = getConfig().SITE_NAME;
  const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const {
    status, submitState, emailValidationError,
  } = props;

  const { formatMessage } = useIntl();
  const [email, setEmail] = useState(props.email);
  const [bannerEmail, setBannerEmail] = useState('');
  const [formErrors, setFormErrors] = useState('');
  const [validationError, setValidationError] = useState(emailValidationError);
  const navigate = useNavigate();

  useEffect(() => {
    sendPageEvent('login_and_registration', 'reset');
    sendTrackEvent('edx.bi.password_reset_form.viewed', { category: 'user-engagement' });
  }, []);

  useEffect(() => {
    setValidationError(emailValidationError);
  }, [emailValidationError]);

  useEffect(() => {
    if (status === 'complete') {
      setEmail('');
    }
  }, [status]);

  const getValidationMessage = (value) => {
    let error = '';

    if (value === '') {
      error = formatMessage(messages['forgot.password.empty.email.field.error']);
    } else if (!emailRegex.test(value)) {
      error = formatMessage(messages['forgot.password.page.invalid.email.message']);
    }

    return error;
  };

  const handleBlur = () => {
    props.setForgotPasswordFormData({ email, emailValidationError: getValidationMessage(email) });
  };

  const handleFocus = () => props.setForgotPasswordFormData({ emailValidationError: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setBannerEmail(email);

    const error = getValidationMessage(email);
    if (error) {
      setFormErrors(error);
      props.setForgotPasswordFormData({ email, emailValidationError: error });
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else {
      props.forgotPassword(email);
    }
  };

  const tabTitle = (
    <div className="d-inline-flex flex-wrap align-items-center">
      <Icon src={ChevronLeft} />
      <span className="ml-2">{formatMessage(messages['sign.in.text'])}</span>
    </div>
  );

  return (
    <BaseContainer>
      <Helmet>
        <title>{formatMessage(messages['forgot.password.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div>
        <Tabs activeKey="" id="controlled-tab" onSelect={(key) => navigate(updatePathWithQueryParams(key))}>
          <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
        </Tabs>
        <div id="main-content" className="main-content">
          <Form id="forget-password-form" name="forget-password-form" className="mw-xs">
            <ForgotPasswordAlert email={bannerEmail} emailError={formErrors} status={status} />
            <h2 className="h4">
              {formatMessage(messages['forgot.password.page.heading'])}
            </h2>
            <p className="mb-4">
              {formatMessage(messages['forgot.password.page.instructions'])}
            </p>
            <FormGroup
              floatingLabel={formatMessage(messages['forgot.password.page.email.field.label'])}
              name="email"
              value={email}
              autoComplete="on"
              errorMessage={validationError}
              handleChange={(e) => setEmail(e.target.value)}
              handleBlur={handleBlur}
              handleFocus={handleFocus}
              helpText={[formatMessage(messages['forgot.password.email.help.text'], { platformName })]}
            />
            <StatefulButton
              id="submit-forget-password"
              name="submit-forget-password"
              type="submit"
              variant="brand"
              className="forgot-password--button"
              state={submitState}
              labels={{
                default: formatMessage(messages['forgot.password.page.submit.button']),
                pending: '',
              }}
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            {(getConfig().LOGIN_ISSUE_SUPPORT_LINK) && (
              <Hyperlink
                id="forgot-password"
                name="forgot-password"
                className="ml-4 font-weight-500 text-body"
                destination={getConfig().LOGIN_ISSUE_SUPPORT_LINK}
                target="_blank"
                showLaunchIcon={false}
              >
                {formatMessage(messages['need.help.sign.in.text'])}
              </Hyperlink>
            )}
            <p className="mt-5.5 small text-gray-700">
              {formatMessage(messages['additional.help.text'], { platformName })}
              <span>
                <Hyperlink isInline destination={`mailto:${getConfig().INFO_EMAIL}`}>{getConfig().INFO_EMAIL}</Hyperlink>
              </span>
            </p>
          </Form>
        </div>
      </div>
    </BaseContainer>
  );
};

ForgotPasswordPage.propTypes = {
  email: PropTypes.string,
  emailValidationError: PropTypes.string,
  forgotPassword: PropTypes.func.isRequired,
  setForgotPasswordFormData: PropTypes.func.isRequired,
  status: PropTypes.string,
  submitState: PropTypes.string,
};

ForgotPasswordPage.defaultProps = {
  email: '',
  emailValidationError: '',
  status: null,
  submitState: DEFAULT_STATE,
};

export default connect(
  forgotPasswordResultSelector,
  {
    forgotPassword,
    setForgotPasswordFormData,
  },
)(ForgotPasswordPage);
