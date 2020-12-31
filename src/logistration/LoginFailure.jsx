import React from 'react';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';

import { processLink } from '../data/utils/dataUtils';
import { INACTIVE_USER, INTERNAL_SERVER_ERROR, NON_COMPLIANT_PASSWORD_EXCEPTION } from './data/constants';
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
            id="login.non.compliant.password.error"
            defaultMessage="{passwordComplaintRequirements} {lineBreak}Your current password does not meet the new security
            requirements. We just sent a password-reset message to the email address associated with this account.
            Thank you for helping us keep your data safe."
            values={{
              passwordComplaintRequirements: <strong>{intl.formatMessage(messages['logistration.non.compliant.password.title'])}</strong>,
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
          <FormattedMessage
            id="logistration.contact.support.link"
            defaultMessage="contact {platformName} Support"
            description="Link text used in inactive user error message to go to learner help center"
            values={{ platformName: context.platformName }}
          />
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
    case INTERNAL_SERVER_ERROR:
      errorList = (
        <li key={INTERNAL_SERVER_ERROR}>
          <FormattedMessage
            id="login.internal.server.error.message"
            defaultMessage="An error has occurred. Try refreshing the page, or check your Internet connection."
            description="Error message that appears when server responds with 500 error code"
          />
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
              <Hyperlink destination={link}>{linkText}</Hyperlink>
              {afterLink}
            </li>
          );
        }
        return <li key={error}>{error}</li>;
      });
  }

  return (
    <Alert variant="danger">
      <Alert.Heading>
        <FormattedMessage
          id="logistration.login.failure.header.title"
          defaultMessage="We couldn't sign you in."
          description="login failure header message."
        />
      </Alert.Heading>
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
