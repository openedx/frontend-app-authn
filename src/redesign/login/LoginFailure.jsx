import React from 'react';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import processLink from '../data/utils';
import {
  ACCOUNT_LOCKED_OUT,
  FAILED_LOGIN_ATTEMPT,
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INCORRECT_EMAIL_PASSWORD,
  INTERNAL_SERVER_ERROR,
  INVALID_FORM,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
} from './data/constants';
import messages from './messages';

const LoginFailureMessage = (props) => {
  const { intl } = props;
  const { context, errorCode, value } = props.loginError;
  let errorList;
  let link;
  let resetLink = (
    <>
      <a href="/reset">
        {intl.formatMessage(messages['login.incorrect.credentials.error.reset.link.text'])}
      </a>
    </>
  );

  switch (errorCode) {
    case NON_COMPLIANT_PASSWORD_EXCEPTION: {
      errorList = (
        <FormattedMessage
          id="non.compliant.password.error"
          defaultMessage="{passwordComplaintRequirements} {lineBreak}Your current password does not meet the new security
          requirements. We just sent a password-reset message to the email address associated with this account.
          Thank you for helping us keep your data safe."
          values={{
            passwordComplaintRequirements: <strong>{intl.formatMessage(messages['non.compliant.password.title'])}</strong>,
            lineBreak: <br />,
          }}
        />
      );
      break;
    }
    case FORBIDDEN_REQUEST:
      errorList = intl.formatMessage(messages['login.rate.limit.reached.message']);
      break;
    case INACTIVE_USER: {
      const supportLink = (
        <a href={context.supportLink}>
          {intl.formatMessage(messages['contact.support.link'], { platformName: context.platformName })}
        </a>
      );
      errorList = (
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
      );
      break;
    }
    case INTERNAL_SERVER_ERROR:
      errorList = intl.formatMessage(messages['internal.server.error.message']);
      break;
    case INVALID_FORM:
      errorList = intl.formatMessage(messages['login.form.invalid.error.message']);
      break;
    case FAILED_LOGIN_ATTEMPT: {
      resetLink = (
        <a href="/reset">
          {intl.formatMessage(messages['login.incorrect.credentials.error.before.account.blocked.text'])}
        </a>
      );
      errorList = (
        <FormattedMessage
          id="login.incorrect.credentials.error.attempts.text"
          description="Error message for incorrect email or password including attempts"
          defaultMessage="The username, email or password you entered is incorrect. You have {remainingAttempts} more sign in
            attempts before your account is temporarily locked.{lineBreak}
            {lineBreak}If you've forgotten your password, {resetLink}"
          values={{
            lineBreak: <br />,
            remainingAttempts: context.remainingAttempts,
            resetLink,
          }}
        />
      );
      break;
    }
    case ACCOUNT_LOCKED_OUT: {
      errorList = (
        <FormattedMessage
          id="login.locked.out.error.message"
          description="Account locked out user message"
          defaultMessage="To protect your account, its been temporarily locked. Try again in 30 minutes. {lineBreak}
          {lineBreak} To be on the safe side, you can {resetLink} before try again."
          values={{
            lineBreak: <br />,
            resetLink,
          }}
        />
      );
      break;
    }
    case INCORRECT_EMAIL_PASSWORD:
      if (context.failureCount <= 1) {
        errorList = intl.formatMessage(messages['login.incorrect.credentials.error']);
      } else if (context.failureCount === 2) {
        errorList = (
          <FormattedMessage
            id="login.incorrect.credentials.error.with.reset.link"
            defaultMessage="The username, email or password you entered is incorrect. Please try again or {resetLink}."
            values={{ resetLink }}
          />
        );
      }
      break;
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
            <li key={error}>
              {beforeLink}
              <a href={link}>{linkText}</a>
              {afterLink}
            </li>
          );
        }
        return <li key={error}>{error}</li>;
      });
  }

  return (
    <Alert id="login-failure-alert" className="mb-5" variant="danger" icon={Error}>
      <Alert.Heading>{intl.formatMessage(messages['login.failure.header.title'])}</Alert.Heading>
      <p>{ errorList }</p>
    </Alert>
  );
};

LoginFailureMessage.defaultProps = {
  loginError: {
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
  }),
  intl: intlShape.isRequired,
};

export default injectIntl(LoginFailureMessage);
