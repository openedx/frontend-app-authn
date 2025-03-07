import React, { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow, ModalDialog, useToggle,
} from '@openedx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

import messages from './messages';
import { DEFAULT_REDIRECT_URL, RESET_PAGE } from '../data/constants';
import { updatePathWithQueryParams } from '../data/utils';
import useMobileResponsive from '../data/utils/useMobileResponsive';

const ChangePasswordPrompt = ({ variant, redirectUrl }) => {
  const isMobileView = useMobileResponsive();
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
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectToResetPasswordPage) {
      navigate(updatePathWithQueryParams(RESET_PAGE));
    }
  }, [redirectToResetPasswordPage, navigate]);

  return (
    <ModalDialog
      title="Password security"
      isOpen={isOpen}
      onClose={close}
      size={isMobileView ? 'sm' : 'md'}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {formatMessage(messages[`password.security.${variant}.title`])}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {formatMessage(messages[`password.security.${variant}.body`])}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow className={classNames(
          { 'd-flex flex-column': isMobileView },
        )}
        >
          {variant === 'nudge' ? (
            <ModalDialog.CloseButton id="password-security-close" variant="tertiary">
              {formatMessage(messages['password.security.close.button'])}
            </ModalDialog.CloseButton>
          ) : null}
          <Link
            id="password-security-reset-password"
            className={classNames(
              'btn btn-primary',
              { 'w-100': isMobileView },
            )}
            to={updatePathWithQueryParams(RESET_PAGE)}
          >
            {formatMessage(messages['password.security.redirect.to.reset.password.button'])}
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
  variant: PropTypes.oneOf(['nudge', 'block']),
  redirectUrl: PropTypes.string,
};

export default ChangePasswordPrompt;
