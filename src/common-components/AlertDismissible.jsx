import React, { useState } from 'react';
import { Alert, Icon } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { injectIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

function AlertDismissible(props) {
  const [show, setShow] = useState(true);

  return show ? (
    <Alert variant={props.variant} onClose={() => setShow(false)} dismissible className="pb-1 pt-1">
      <Icon src={Info} className="alert-icon" />
      <p>{props.msg}</p>
    </Alert>
  ) : null;
}

AlertDismissible.propTypes = {
  variant: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
};

export default injectIntl(AlertDismissible);
