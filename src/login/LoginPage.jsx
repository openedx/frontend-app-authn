import { useEffect, useMemo, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, StatefulButton } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import {
  FormGroup,
  InstitutionLogistration,
  PasswordField,
  RedirectLogistration,
  ThirdPartyAuthAlert,
} from '../common-components';
import AccountActivationMessage from './AccountActivationMessage';
import { useThirdPartyAuthContext } from '../common-components/components/ThirdPartyAuthContext';
import { useThirdPartyAuthHook } from '../common-components/data/apiHook';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import ThirdPartyAuth from '../common-components/ThirdPartyAuth';
import { PENDING_STATE, RESET_PAGE } from '../data/constants';
import {
  getActivationStatus,
  getAllPossibleQueryParams,
  getTpaHint,
  getTpaProvider,
  updatePathWithQueryParams,
} from '../data/utils';
import ResetPasswordSuccess from '../reset-password/ResetPasswordSuccess';
import { useLoginContext } from './components/LoginContext';
import { useLogin } from './data/apiHook';
import { INVALID_FORM, TPA_AUTHENTICATION_FAILURE } from './data/constants';
import LoginFailureMessage from './LoginFailure';
import messages from './messages';

const LoginPage = ({
  institutionLogin,
  handleInstitutionLogin,
  showResetPasswordSuccessBanner: propShowResetPasswordSuccessBanner = false,
  dismissPasswordResetBanner,
}) => {
  // Context for third-party auth
  const {
    thirdPartyAuthApiStatus,
    thirdPartyAuthContext,
    setThirdPartyAuthContextBegin,
    setThirdPartyAuthContextSuccess,
    setThirdPartyAuthContextFailure,
  } = useThirdPartyAuthContext();

  const {
    formFields,
    setFormFields,
    errors,
    setErrors,
  } = useLoginContext();

  // Hook for third-party auth API call
  const { mutate: fetchThirdPartyAuth } = useThirdPartyAuthHook();

  // React Query for server state
  const [loginResult, setLoginResult] = useState({ success: false, redirectUrl: '' });
  const [errorCode, setErrorCode] = useState({
    type: '',
    count: 0,
    context: {},
  });
  const { mutate: loginUser, isPending: isLoggingIn } = useLogin({
    onSuccess: (data) => {
      setLoginResult({ success: true, redirectUrl: data.redirectUrl || '' });
    },
    onError: (formattedError) => {
      setErrorCode({
        type: formattedError.type,
        count: errorCode.count + 1,
        context: formattedError.context,
      });
    },
  });

  const [showResetPasswordSuccessBanner,
    setShowResetPasswordSuccessBanner] = useState(propShowResetPasswordSuccessBanner);
  const {
    providers,
    currentProvider,
    secondaryProviders,
    finishAuthUrl,
    platformName,
    errorMessage: thirdPartyErrorMessage,
  } = thirdPartyAuthContext;
  const { formatMessage } = useIntl();
  const activationMsgType = getActivationStatus();
  const queryParams = useMemo(() => getAllPossibleQueryParams(), []);

  const tpaHint = useMemo(() => getTpaHint(), []);

  useEffect(() => {
    sendPageEvent('login_and_registration', 'login');
  }, []);

  // Fetch third-party auth context data
  useEffect(() => {
    const payload = { ...queryParams };
    if (tpaHint) {
      payload.tpa_hint = tpaHint;
    }
    setThirdPartyAuthContextBegin();
    fetchThirdPartyAuth(payload, {
      onSuccess: (data) => {
        setThirdPartyAuthContextSuccess(
          data.fieldDescriptions,
          data.optionalFields,
          data.thirdPartyAuthContext,
        );
      },
      onError: () => {
        setThirdPartyAuthContextFailure();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, tpaHint, setThirdPartyAuthContextBegin]);

  useEffect(() => {
    if (thirdPartyErrorMessage) {
      setErrorCode((prevState) => ({
        type: TPA_AUTHENTICATION_FAILURE,
        count: prevState.count + 1,
        context: {
          errorMessage: thirdPartyErrorMessage,
        },
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdPartyErrorMessage]);

  const validateFormFields = (payload) => {
    const {
      emailOrUsername,
      password,
    } = payload;
    const fieldErrors = { ...errors };

    if (emailOrUsername === '') {
      fieldErrors.emailOrUsername = formatMessage(messages['email.validation.message']);
    } else if (emailOrUsername.length < 2) {
      fieldErrors.emailOrUsername = formatMessage(messages['username.or.email.format.validation.less.chars.message']);
    }
    if (password === '') {
      fieldErrors.password = formatMessage(messages['password.validation.message']);
    }

    return { ...fieldErrors };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (showResetPasswordSuccessBanner) {
      setShowResetPasswordSuccessBanner(false);
      if (dismissPasswordResetBanner) {
        dismissPasswordResetBanner();
      }
    }

    const formData = { ...formFields };
    const validationErrors = validateFormFields(formData);
    if (validationErrors.emailOrUsername || validationErrors.password) {
      setErrors(validationErrors);
      setErrorCode({
        type: INVALID_FORM,
        count: errorCode.count + 1,
        context: {},
      });
      return;
    }

    // add query params to the payload
    const payload = {
      email_or_username: formData.emailOrUsername,
      password: formData.password,
      ...queryParams,
    };
    loginUser(payload);
  };

  const handleOnChange = (event) => {
    const {
      name,
      value,
    } = event.target;
    // Save to context for persistence across tab switches
    setFormFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '',
    }));
  };
  const trackForgotPasswordLinkClick = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  const {
    provider,
    skipHintedLogin,
  } = getTpaProvider(tpaHint, providers, secondaryProviders);

  if (tpaHint) {
    if (thirdPartyAuthApiStatus === PENDING_STATE) {
      return <Skeleton height={36} />;
    }

    if (skipHintedLogin) {
      window.location.href = getConfig().LMS_BASE_URL + provider.loginUrl;
      return null;
    }

    if (provider) {
      return <EnterpriseSSO provider={provider} />;
    }
  }

  if (institutionLogin) {
    return (
      <InstitutionLogistration
        secondaryProviders={secondaryProviders}
        headingTitle={formatMessage(messages['institution.login.page.title'])}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages['login.page.title'], { siteName: getConfig().SITE_NAME })}</title>
      </Helmet>
      <RedirectLogistration
        success={loginResult.success}
        redirectUrl={loginResult.redirectUrl}
        finishAuthUrl={finishAuthUrl}
      />
      <div className="mw-xs mt-3 mb-2">
        <LoginFailureMessage
          errorCode={errorCode.type}
          errorCount={errorCode.count}
          context={errorCode.context}
        />
        <ThirdPartyAuthAlert
          currentProvider={currentProvider}
          platformName={platformName}
        />
        <AccountActivationMessage
          messageType={activationMsgType}
        />
        {showResetPasswordSuccessBanner && <ResetPasswordSuccess />}
        <Form id="sign-in-form" name="sign-in-form">
          <FormGroup
            name="emailOrUsername"
            value={formFields.emailOrUsername}
            autoComplete="on"
            handleChange={handleOnChange}
            handleFocus={handleOnFocus}
            errorMessage={errors.emailOrUsername}
            floatingLabel={formatMessage(messages['login.user.identity.label'])}
          />
          <PasswordField
            name="password"
            value={formFields.password}
            autoComplete="off"
            showScreenReaderText={false}
            showRequirements={false}
            handleChange={handleOnChange}
            handleFocus={handleOnFocus}
            errorMessage={errors.password}
            floatingLabel={formatMessage(messages['login.password.label'])}
          />
          <StatefulButton
            name="sign-in"
            id="sign-in"
            type="submit"
            variant="brand"
            className="login-button-width"
            state={(isLoggingIn ? PENDING_STATE : 'default')}
            labels={{
              default: formatMessage(messages['sign.in.button']),
              pending: 'pending',
            }}
            onClick={handleSubmit}
            onMouseDown={(event) => event.preventDefault()}
          />
          <Link
            id="forgot-password"
            name="forgot-password"
            className="btn btn-link font-weight-500 text-body"
            to={updatePathWithQueryParams(RESET_PAGE)}
            onClick={trackForgotPasswordLinkClick}
          >
            {formatMessage(messages['forgot.password'])}
          </Link>
          <ThirdPartyAuth
            currentProvider={currentProvider}
            providers={providers}
            secondaryProviders={secondaryProviders}
            handleInstitutionLogin={handleInstitutionLogin}
            thirdPartyAuthApiStatus={thirdPartyAuthApiStatus}
            isLoginPage
          />
        </Form>
      </div>
    </>
  );
};

LoginPage.propTypes = {
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
  showResetPasswordSuccessBanner: PropTypes.bool,
  dismissPasswordResetBanner: PropTypes.func,
};

export default LoginPage;
