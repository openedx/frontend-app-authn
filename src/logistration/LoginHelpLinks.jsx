import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import SwitchContent from './SwitchContent';
import messages from './LoginHelpLinks.messages';

const LoginHelpLinks = (props) => {
  const { intl, page } = props;
  const [showLoginHelp, setShowLoginHelpValue] = useState(false);

  const toggleLoginHelp = (e) => {
    e.preventDefault();
    setShowLoginHelpValue(!showLoginHelp);
  };

  const forgotPasswordLink = () => (
    <a className="field-link" href="/reset">
      {intl.formatMessage(messages['logistration.forgot.password.link'])}
    </a>
  );

  const signUpLink = () => (
    <a className="field-link" href="/register">
      {intl.formatMessage(messages['logistration.register.link'])}
    </a>
  );

  const getHelpButtonMessage = () => {
    let mid = 'logistration.need.other.help.signing.in.collapsible.menu';
    if (page === 'login') {
      mid = 'logistration.need.help.signing.in.collapsible.menu';
    }

    return intl.formatMessage(messages[mid]);
  };

  const renderLoginHelp = () => (
    <div className="login-help">
      { page === 'login' ? forgotPasswordLink() : signUpLink()}
      <a className="field-link" href="https://support.edx.org/hc/en-us/sections/115004153367-Solve-a-Sign-in-Problem">
        {intl.formatMessage(messages['logistration.other.sign.in.issues'])}
      </a>
    </div>
  );

  return (
    <>
      <button type="button" className="mt-1 field-link" onClick={toggleLoginHelp}>
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
