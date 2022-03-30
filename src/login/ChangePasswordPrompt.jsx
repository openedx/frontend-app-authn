import React, { useState } from 'react';

import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  ActionRow, Button, ModalDialog, useToggle,
} from '@edx/paragon';

import messages from './messages';
import { DEFAULT_REDIRECT_URL, RESET_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';

const ChangePasswordPrompt = ({ intl, variant, redirectUrl }) => {
  const [redirectToResetPasswordPage, setRedirectToResetPasswordPage] = useState(false);
  const handlers = {
    handleToggleOff: () => {
      if (variant === 'block') {
        setRedirectToResetPasswordPage(true);
      } else {
        window.location.href = redirectUrl || getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
      }
    },
  };
  // eslint-disable-next-line no-unused-vars
  const [isOpen, open, close] = useToggle(true, handlers);

  if (redirectToResetPasswordPage) {
    return <Redirect to={updatePathWithQueryParams(RESET_PAGE)} />;
  }
  return (
    <ModalDialog
      title="Password security"
      isOpen={isOpen}
      onClose={close}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages[`password.security.${variant}.title`])}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {intl.formatMessage(messages[`password.security.${variant}.body`])}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          {variant === 'nudge' ? (
            <Button id="password-security-close" variant="tertiary" onClick={close}>
              {intl.formatMessage(messages['password.security.close.button'])}
            </Button>
          ) : null}
          <Link
            id="password-security-reset-password"
            className="btn btn-primary"
            to={updatePathWithQueryParams(RESET_PAGE)}
          >
            {intl.formatMessage(messages['password.security.redirect.to.reset.password.button'])}
          </Link>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ChangePasswordPrompt.defaultProps = {
  variant: 'block',
  redirectUrl: null,
};

ChangePasswordPrompt.propTypes = {
  intl: intlShape.isRequired,
  variant: PropTypes.oneOf(['nudge', 'block']),
  redirectUrl: PropTypes.string,
};

export default injectIntl(ChangePasswordPrompt);
