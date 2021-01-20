import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import SwitchContent from '../common-components/SwitchContent';
import {
  LOGIN_PAGE,
  REGISTER_PAGE,
  RESET_PAGE,
} from '../data/constants';
import messages from './messages';

const LoginHelpLinks = (props) => {
  const { intl, page } = props;
  const [showLoginHelp, setShowLoginHelpValue] = useState(false);

  const toggleLoginHelp = (e) => {
    e.preventDefault();
    setShowLoginHelpValue(!showLoginHelp);
  };

  const forgotPasswordLink = () => (
    <a className="field-link" href={RESET_PAGE}>
      {intl.formatMessage(messages['forgot.password.link'])}
    </a>
  );

  const signUpLink = () => (
    <a className="field-link" href={REGISTER_PAGE}>
      {intl.formatMessage(messages['register.link'])}
    </a>
  );

  const loginIssueSupportURL = (config) => (config.LOGIN_ISSUE_SUPPORT_LINK
    ? (
      <a className="field-link" href={config.LOGIN_ISSUE_SUPPORT_LINK}>
        {intl.formatMessage(messages['other.sign.in.issues'])}
      </a>
    )
    : null);

  const getHelpButtonMessage = () => {
    let mid = 'need.other.help.signing.in.collapsible.menu';
    if (page === LOGIN_PAGE) {
      mid = 'need.help.signing.in.collapsible.menu';
    }

    return intl.formatMessage(messages[mid]);
  };

  const renderLoginHelp = () => (
    <div className="login-help small">
      { page === LOGIN_PAGE ? forgotPasswordLink() : signUpLink() }
      { loginIssueSupportURL(getConfig()) }
    </div>
  );

  return (
    <>
      <button type="button" className="mt-1 field-link small" onClick={toggleLoginHelp}>
        <FontAwesomeIcon className="mr-1" icon={showLoginHelp ? faCaretDown : faCaretRight} />
        {getHelpButtonMessage()}
      </button>
      <SwitchContent
        expression={showLoginHelp ? 'showHelp' : 'default'}
        cases={{
          showHelp: renderLoginHelp(),
          default: <></>,
        }}
      />
    </>
  );
};

LoginHelpLinks.propTypes = {
  intl: intlShape.isRequired,
  page: PropTypes.string.isRequired,
};

export default injectIntl(LoginHelpLinks);
