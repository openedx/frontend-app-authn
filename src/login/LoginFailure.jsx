import React from 'react';

import { getAuthService } from '@edx/frontend-platform/auth';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import processLink from '../data/utils';
import ChangePasswordPrompt from './ChangePasswordPrompt';
import {
  ACCOUNT_LOCKED_OUT,
  FAILED_LOGIN_ATTEMPT,
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INCORRECT_EMAIL_PASSWORD,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
  NUDGE_PASSWORD_CHANGE,
  REQUIRE_PASSWORD_CHANGE,
} from './data/constants';
import messages from './messages';

const LoginFailureMessage = (props) => {
  const { intl } = props;
  const { context, errorCode, value } = props.loginError;
  const authService = getAuthService();
  let errorList;
  let link;
  let resetLink = (
    <Hyperlink destination="/reset" isInline>
      {intl.formatMessage(messages['login.incorrect.credentials.error.reset.link.text'])}
    </Hyperlink>
  );

  switch (errorCode) {
    case NON_COMPLIANT_PASSWORD_EXCEPTION: {
      errorList = (
        <>
          <strong>{intl.formatMessage(messages['non.compliant.password.title'])}</strong>
          <p>{intl.formatMessage(messages['non.compliant.password.message'])}</p>
        </>
      );
      break;
    }
    case FORBIDDEN_REQUEST:
      errorList = <p>{intl.formatMessage(messages['login.rate.limit.reached.message'])}</p>;
      break;
    case INACTIVE_USER: {
      const supportLink = (
        <a href={context.supportLink}>
          {intl.formatMessage(messages['contact.support.link'], { platformName: context.platformName })}
        </a>
      );
      errorList = (
        <p>
          <FormattedMessage
            id="login.inactive.user.error"
            defaultMessage="In order to sign in, you need to activate your account.{lineBreak}
            {lineBreak}We just sent an activation link to {email}. If you do not receive an email,
            check your spam folders or {supportLink}."
            values={{
              lineBreak: <br />,
              email: <strong className="data-hj-suppress">{props.loginError.email}</strong>,
              supportLink,
            }}
          />
        </p>
      );
      break;
    }
    case INTERNAL_SERVER_ERROR:
      errorList = <p>{intl.formatMessage(messages['internal.server.error.message'])}</p>;
      break;
    case INVALID_FORM:
      errorList = <p>{intl.formatMessage(messages['login.form.invalid.error.message'])}</p>;
      break;
    case FAILED_LOGIN_ATTEMPT: {
      resetLink = (
        <Hyperlink destination="/reset" isInline>
          {intl.formatMessage(messages['login.incorrect.credentials.error.before.account.blocked.text'])}
        </Hyperlink>
      );
      errorList = (
        <>
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.attempts.text.1"
              description="Error message for incorrect email or password"
              defaultMessage="The username, email or password you entered is incorrect. You have {remainingAttempts} more sign in
                attempts before your account is temporarily locked."
              values={{ remainingAttempts: context.remainingAttempts }}
            />
          </p>
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.attempts.text.2"
              description="Part of error message for incorrect email or password"
              defaultMessage="If you've forgotten your password, {resetLink}"
              values={{ resetLink }}
            />
          </p>
        </>
      );
      break;
    }
    case ACCOUNT_LOCKED_OUT: {
      errorList = (
        <>
          <p>{intl.formatMessage(messages['account.locked.out.message.1'])}</p>
          <p>
            <FormattedMessage
              id="account.locked.out.message.2"
              description="Part of message for when user account has been locked out after multiple failed login attempts"
              defaultMessage="To be on the safe side, you can {resetLink} before trying again."
              values={{ resetLink }}
            />
          </p>
        </>
      );
      break;
    }
    case INCORRECT_EMAIL_PASSWORD:
      if (context.failureCount <= 1) {
        errorList = <p>{intl.formatMessage(messages['login.incorrect.credentials.error'])}</p>;
      } else if (context.failureCount === 2) {
        errorList = (
          <p>
            <FormattedMessage
              id="login.incorrect.credentials.error.with.reset.link"
              defaultMessage="The username, email, or password you entered is incorrect. Please try again or {resetLink}."
              values={{ resetLink }}
            />
          </p>
        );
      }
      break;
    case NUDGE_PASSWORD_CHANGE:
      // Need to clear the CSRF token here to fetch a new one because token is already rotated after successful login.
      if (authService) {
        authService.getCsrfTokenService().clearCsrfTokenCache();
      }
      return (
        <ChangePasswordPrompt
          redirectUrl={props.loginError.redirectUrl}
          variant="nudge"
        />
      );
    case REQUIRE_PASSWORD_CHANGE:
      return <ChangePasswordPrompt />;
    default:
      // TODO: use errorCode instead of processing error messages on frontend
      errorList = value.trim().split('\n');
      errorList = errorList.map((error) => {
        let matches;
        if (error.includes('a href')) {
          matches = processLink(error);
          const [beforeLink, href, linkText, afterLink] = matches;
          link = href;
          if (href.indexOf('/dashboard?tpa_hint') === 0) {
            link = `/login?next=${href}`;
          }
          return (
            <p key={error}>
              {beforeLink}
              <a href={link}>{linkText}</a>
              {afterLink}
            </p>
          );
        }
        return <p key={error}>{error}</p>;
      });
  }

  return (
    <Alert id="login-failure-alert" className="mb-5" variant="danger" icon={Error}>
      <Alert.Heading>{intl.formatMessage(messages['login.failure.header.title'])}</Alert.Heading>
      { errorList }
    </Alert>
  );
};

LoginFailureMessage.defaultProps = {
  loginError: {
    redirectUrl: null,
    errorCode: null,
    value: '',
  },
};

LoginFailureMessage.propTypes = {
  loginError: PropTypes.shape({
    context: PropTypes.object,
    email: PropTypes.string,
    errorCode: PropTypes.string,
    value: PropTypes.string,
    redirectUrl: PropTypes.string,
  }),
  intl: intlShape.isRequired,
};

export default injectIntl(LoginFailureMessage);
