import React, { useState } from 'react';
import { Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { injectIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

function AlertDismissible(props) {
  const [show, setShow] = useState(true);

  return show ? (
    <Alert variant={props.variant} onClose={() => setShow(false)} dismissible className="pb-2 pt-2 mt-2" icon={Info}>
      <p className="mb-0">{props.msg}{' '}<Alert.Link href="#">{props.email}</Alert.Link>?</p>
    </Alert>
  ) : null;
}

AlertDismissible.propTypes = {
  variant: PropTypes.string.isRequired,
  msg: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default injectIntl(AlertDismissible);
