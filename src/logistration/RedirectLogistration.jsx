import React from 'react';
import PropTypes from 'prop-types';

function RedirectLogistration(props) {
  const { success, redirectUrl } = props;
  if (success) {
    window.location.href = redirectUrl;
  }
  return <></>;
}

RedirectLogistration.defaultProps = {
  redirectUrl: '',
  success: false,
};

RedirectLogistration.propTypes = {
  redirectUrl: PropTypes.string,
  success: PropTypes.bool,
};


export default RedirectLogistration;
