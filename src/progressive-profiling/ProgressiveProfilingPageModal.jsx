import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';
import { ActionRow, Button, ModalDialog } from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const ProgressiveProfilingPageModal = (props) => {
  const { intl, isOpen, redirectUrl } = props;
  const platformName = getConfig().SITE_NAME;

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = redirectUrl;
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages['modal.title'])}
      isOpen={isOpen}
      onClose={() => {}}
      size="sm"
      variant="default"
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages['modal.title'])}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {intl.formatMessage(messages['modal.description'])}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button onClick={handleSubmit} variant="primary">
            {intl.formatMessage(messages['continue.to.platform'], { platformName })}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ProgressiveProfilingPageModal.propTypes = {
  intl: PropTypes.objectOf(PropTypes.object).isRequired,
  isOpen: PropTypes.bool,
  redirectUrl: PropTypes.string.isRequired,
};

ProgressiveProfilingPageModal.defaultProps = {
  isOpen: false,
};

export default injectIntl(ProgressiveProfilingPageModal);
