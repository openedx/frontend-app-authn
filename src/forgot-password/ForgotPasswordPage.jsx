import { useEffect, useState } from 'react';

import {
  getSiteConfig, sendPageEvent, sendTrackEvent, useAppConfig, useIntl,
} from '@openedx/frontend-base';
import {
  Form,
  Hyperlink,
  Icon,
  StatefulButton,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';

import { useForgotPassword } from './data/apiHook';
import ForgotPasswordAlert from './ForgotPasswordAlert';
import messages from './messages';
import BaseContainer from '../base-container';
import { FormGroup } from '../common-components';
import { LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';

const ForgotPasswordPage = () => {
  const platformName = getSiteConfig().siteName;
  const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const appConfig = useAppConfig();
  const [email, setEmail] = useState('');
  const [bannerEmail, setBannerEmail] = useState('');
  const [formErrors, setFormErrors] = useState('');
  const [validationError, setValidationError] = useState('');
  const [status, setStatus] = useState(location.state?.status || null);

  // React Query hook for forgot password
  const { mutate: sendForgotPassword, isPending: isSending } = useForgotPassword();

  const submitState = isSending ? 'pending' : 'default';

  useEffect(() => {
    sendPageEvent('login_and_registration', 'reset');
    sendTrackEvent('edx.bi.password_reset_form.viewed', { category: 'user-engagement' });
  }, []);

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
    setValidationError(getValidationMessage(email));
  };

  const handleFocus = () => {
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBannerEmail(email);

    const validateError = getValidationMessage(email);
    if (validateError) {
      setFormErrors(validateError);
      setValidationError(validateError);
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    } else {
      setFormErrors('');
      sendForgotPassword(email, {
        onSuccess: (data, emailUsed) => {
          setStatus('complete');
          setBannerEmail(emailUsed);
          setFormErrors('');
        },
        onError: (error) => {
          if (error.response && error.response.status === 403) {
            setStatus('forbidden');
          } else {
            setStatus('server-error');
          }
        },
      });
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
          { siteName: getSiteConfig().siteName })}
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
            {(appConfig.LOGIN_ISSUE_SUPPORT_LINK) && (
              <Hyperlink
                id="forgot-password"
                name="forgot-password"
                className="ml-4 font-weight-500 text-body"
                destination={appConfig.LOGIN_ISSUE_SUPPORT_LINK}
                target="_blank"
                showLaunchIcon={false}
              >
                {formatMessage(messages['need.help.sign.in.text'])}
              </Hyperlink>
            )}
            <p className="mt-5.5 small text-gray-700">
              {formatMessage(messages['additional.help.text'], { platformName })}
              <span className="mx-1">
                <Hyperlink isInline destination={`mailto:${appConfig.INFO_EMAIL}`}>{appConfig.INFO_EMAIL}</Hyperlink>
              </span>
            </p>
          </Form>
        </div>
      </div>
    </BaseContainer>
  );
};

export default ForgotPasswordPage;
