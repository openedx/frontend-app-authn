import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@edx/paragon';

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

  const handleForgotPasswordLinkClickEvent = () => {
    sendTrackEvent('edx.bi.password-reset_form.toggled', { category: 'user-engagement' });
  };

  const forgotPasswordLink = () => (
    <Link
      to={RESET_PAGE}
      onClick={handleForgotPasswordLinkClickEvent}
    >
      {intl.formatMessage(messages['forgot.password.link'])}
    </Link>
  );

  const signUpLink = () => (
    <Link to={REGISTER_PAGE}>{intl.formatMessage(messages['register.link'])}</Link>

  );

  const loginIssueSupportURL = (config) => (config.LOGIN_ISSUE_SUPPORT_LINK
    ? (
      <Hyperlink className="field-link" destination={config.LOGIN_ISSUE_SUPPORT_LINK}>
        {intl.formatMessage(messages['other.sign.in.issues'])}
      </Hyperlink>
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
      <button type="button" className="mt-2 field-link small" onClick={toggleLoginHelp}>
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
