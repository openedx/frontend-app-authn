import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Spinner = (props) => {
  const textMessage = props.text;
  return (
    <div className="d-flex justify-content-center reset-password-container">
      <div className="d-flex flex-column" style={{ width: '400px' }}>
        <div className="form-group">
          <div className="d-flex flex-column align-items-start">
            <h3 className="text-center mt-3">
              <FormattedMessage
                id="logistration.reset.password.request.token.validation.message"
                defaultMessage="{textMessage}"
                description=""
                values={{
                  textMessage,
                }}
              />
              <FontAwesomeIcon icon={faSpinner} spin />
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

Spinner.defaultProps = {
  text: '',
};
Spinner.propTypes = {
  text: PropTypes.string,
};
export default Spinner;
