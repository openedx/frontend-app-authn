import React from 'react';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Icon } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
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
  const resetLink = (
    <>
      <Alert.Link href="/reset">
        {intl.formatMessage(messages['login.incorrect.credentials.error.reset.link.text'])}
      </Alert.Link>
    </>
  );

  switch (errorCode) {
    case NON_COMPLIANT_PASSWORD_EXCEPTION: {
      errorList = (
        <li key="password-non-compliance">
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
        </li>
      );
      break;
    }
    case FORBIDDEN_REQUEST:
      errorList = (
        <li key={FORBIDDEN_REQUEST}>
          {intl.formatMessage(messages['login.rate.limit.reached.message'])}
        </li>
      );
      break;
    case INACTIVE_USER: {
      const supportLink = (
        <Alert.Link href={context.supportLink}>
          {intl.formatMessage(messages['contact.support.link'], { platformName: context.platformName })}
        </Alert.Link>
      );
      errorList = (
        <li key={INACTIVE_USER}>
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
        </li>
      );
      break;
    }
    case INTERNAL_SERVER_ERROR:
      errorList = (
        <li key={INTERNAL_SERVER_ERROR}>
          {intl.formatMessage(messages['internal.server.error.message'])}
        </li>
      );
      break;
    case INVALID_FORM:
      errorList = (
        <p>
          {intl.formatMessage(messages['login.form.invalid.error.message'])}
        </p>
      );
      break;
    case FAILED_LOGIN_ATTEMPT: {
      errorList = (
        <FormattedMessage
          id="login.incorrect.credentials.error.attempts.text"
          description="Error message for incorrect email or password including attempts"
          defaultMessage="The username, email or password you entered is incorrect. Please try again or {resetLink}{lineBreak}
            {lineBreak}Attempts remaining:{remainingAttempts}
            {lineBreak}{warning}After {allowedFailureAttempts} unsuccessful login attempts, your account will be locked."
          values={{
            lineBreak: <br />,
            remainingAttempts: <strong> {context.remainingAttempts}</strong>,
            warning: <strong>Warning: </strong>,
            allowedFailureAttempts: <strong>{context.allowedFailureAttempts} consecutive</strong>,
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
          defaultMessage="The username, email or password you entered is incorrect. Please try again or {resetLink}{lineBreak}
          {lineBreak} {blockText}"
          values={{
            lineBreak: <br />,
            resetLink,
            blockText: <p className="text-danger"> Your account {props.loginError.email} is blocked for 30 minutes due to reaching the maximum {context.allowedFailureAttempts} failed login attempts.</p>,
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
              <Alert.Link href={link}>{linkText}</Alert.Link>
              {afterLink}
            </li>
          );
        }
        return <li key={error}>{error}</li>;
      });
  }

  return (
    <Alert id="login-failure-alert" className="mb-5" variant="danger">
      <Icon src={Info} className="alert-icon" />
      <Alert.Heading>{intl.formatMessage(messages['login.failure.header.title'])}</Alert.Heading>
      { errorList }
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
