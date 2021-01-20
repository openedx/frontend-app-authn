import React from 'react';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import { processLink } from '../data/utils/dataUtils';
import {
  FORBIDDEN_REQUEST,
  INACTIVE_USER,
  INTERNAL_SERVER_ERROR,
  NON_COMPLIANT_PASSWORD_EXCEPTION,
} from './data/constants';
import messages from './messages';

const LoginFailureMessage = (props) => {
  const { intl } = props;
  const { context, errorCode, value } = props.loginError;

  let errorList;

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
              email: <strong>{props.loginError.email}</strong>,
              supportLink,
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
    case INTERNAL_SERVER_ERROR:
      errorList = (
        <li key={INTERNAL_SERVER_ERROR}>
          {intl.formatMessage(messages['internal.server.error.message'])}
        </li>
      );
      break;
    default:
      // TODO: use errorCode instead of processing error messages on frontend
      errorList = value.trim().split('\n');
      errorList = errorList.map((error) => {
        let matches;
        if (error.includes('a href')) {
          matches = processLink(error);
          const [beforeLink, link, linkText, afterLink] = matches;
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
    <Alert id="login-failure-alert" variant="danger">
      <Alert.Heading>{intl.formatMessage(messages['login.failure.header.title'])}</Alert.Heading>
      <ul>{errorList}</ul>
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
    context: PropTypes.objectOf(PropTypes.string),
    email: PropTypes.string,
    errorCode: PropTypes.string,
    value: PropTypes.string,
  }),
  intl: intlShape.isRequired,
};

export default injectIntl(LoginFailureMessage);
