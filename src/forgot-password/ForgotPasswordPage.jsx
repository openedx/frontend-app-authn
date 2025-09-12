import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
} from '@openedx/paragon';
import { ArrowLeft, LogIn01 } from '@untitledui/icons';
import { AlertCircle } from '@untitledui/icons/AlertCircle';
import { CheckCircleBroken } from '@untitledui/icons/CheckCircleBroken';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

import { forgotPassword, setForgotPasswordFormData } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import ForgotPasswordAlert from './ForgotPasswordAlert';
import messages from './messages';
import BaseContainer from '../base-container';
import {
  COMPLETE_STATE, DEFAULT_STATE, LOGIN_PAGE, VALID_EMAIL_REGEX,
} from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';
import { PASSWORD_RESET } from '../reset-password/data/constants';
import {
  Description, FormGroupWrapper, GlassCard, LMSLogo, StatefulButtonWrapper, Title,
} from '../shared/index.ts';

const ForgotPasswordPage = (props) => {
  const platformName = getConfig().SITE_NAME;
  const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const {
    submitState, emailValidationError, status,
  } = props;

  const { formatMessage } = useIntl();
  const [email, setEmail] = useState(props.email);
  const [bannerEmail, setBannerEmail] = useState('');
  const [formErrors, setFormErrors] = useState('');
  const [validationError, setValidationError] = useState(emailValidationError);
  const navigate = useNavigate();

  const hasError = useMemo(() => !!formErrors, [formErrors]);

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

  const getPageContent = (currentStatus) => {
    switch (currentStatus) {
      case COMPLETE_STATE:
        return {
          icon: <CheckCircleBroken className="tw-text-green-500 tw-w-8 tw-h-8" />,
          title: formatMessage(messages['forgot.password.confirmation.message.heading']),
          description: formatMessage(messages['forgot.password.confirmation.message']),
        };
      case PASSWORD_RESET.INVALID_TOKEN:
        return {
          icon: <AlertCircle className="tw-text-error-500 tw-w-8 tw-h-8" />,
          title: formatMessage(messages['invalid.token.heading']),
          description: formatMessage(messages['invalid.token.error.message']),
        };
      default:
        return {
          icon: null,
          title: formatMessage(messages['forgot.password.page.heading']),
          description: formatMessage(messages['forgot.password.page.instructions']),
        };
    }
  };

  const handleBlur = () => {
    props.setForgotPasswordFormData({ email, emailValidationError: getValidationMessage(email) });
  };

  const handleFocus = () => props.setForgotPasswordFormData({ emailValidationError: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setBannerEmail(email);

    // Clear any previous errors
    setFormErrors('');

    const error = getValidationMessage(email);
    if (error) {
      setFormErrors(error);
      props.setForgotPasswordFormData({ email, emailValidationError: error });
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else {
      props.forgotPassword(email);
    }
  };

  const renderFormContent = () => {
    switch (status) {
      case PASSWORD_RESET.INVALID_TOKEN:
        return (
          <StatefulButtonWrapper
            id="back-to-login"
            name="back-to-login"
            type="submit"
            variant="secondary"
            state={submitState}
            labels={{
              default: formatMessage(messages['invalid.token.back.to.login']),
              pending: '',
            }}
            onClick={() => navigate(updatePathWithQueryParams(LOGIN_PAGE))}
            onMouseDown={(e) => e.preventDefault()}
          />
        );
      case COMPLETE_STATE:
        return (
          <StatefulButtonWrapper
            id="back-to-login"
            name="back-to-login"
            type="submit"
            variant="link"
            labels={{
              default: formatMessage(messages['email.sent.back.to.login']),
              pending: '',
            }}
            onClick={() => navigate(updatePathWithQueryParams(LOGIN_PAGE))}
            onMouseDown={(e) => e.preventDefault()}
            iconBefore={LogIn01}
          />
        );
      default:
        return (
          <div className="tw-flex tw-flex-col tw-gap-6">
            <FormGroupWrapper
              floatingLabel={formatMessage(messages['forgot.password.page.email.field.label'])}
              name="email"
              value={email}
              autoComplete="on"
              errorMessage={validationError}
              handleChange={(e) => setEmail(e.target.value)}
              handleBlur={handleBlur}
              handleFocus={handleFocus}
              helpText={[formatMessage(messages['forgot.password.email.help.text'], { platformName })]}
              placeholder={formatMessage(messages['forgot.password.page.email.field.placeholder'])}
              label={formatMessage(messages['forgot.password.page.email.field.label'])}
            />
            <StatefulButtonWrapper
              id="submit-forget-password"
              name="submit-forget-password"
              type="submit"
              variant="brand"
              state={submitState}
              labels={{
                default: formatMessage(messages['forgot.password.page.submit.button']),
                pending: '',
              }}
              onClick={handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            {hasError && (
              <StatefulButtonWrapper variant="link" labels={{ default: formatMessage(messages['forgot.password.page.go.back.text']) }} onClick={() => navigate(updatePathWithQueryParams(LOGIN_PAGE))} iconBefore={ArrowLeft} />
            )}
          </div>
        );
    }
  };

  return (
    <BaseContainer>
      <GlassCard className="!tw-w-[576px] !tw-h-fit tw-p-8">
        <Helmet>
          <title>{formatMessage(messages['forgot.password.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        <div className="tw-flex tw-flex-col tw-gap-12 tw-items-center tw-w-full">
          <LMSLogo />
          <div className="tw-flex tw-flex-col tw-gap-8 tw-w-full">
            <div className="tw-text-center">
              <div className="tw-flex tw-justify-center tw-items-center tw-gap-4 tw-mb-3">
                {getPageContent(status).icon}
                <Title status={status} message={getPageContent(status).title} />
              </div>
              <Description message={getPageContent(status).description} />
            </div>
            <Form id="forget-password-form" name="forget-password-form" className="tw-flex tw-flex-col tw-gap-8 tw-w-full">
              <ForgotPasswordAlert email={bannerEmail} emailError={formErrors} status={status} />
              {renderFormContent()}
            </Form>
          </div>
        </div>
      </GlassCard>
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
