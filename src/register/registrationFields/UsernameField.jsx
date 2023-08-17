import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import PropTypes, { string } from 'prop-types';

import { FormGroup } from '../../common-components';
import messages from '../messages';

const UsernameField = (props) => {
  const { formatMessage } = useIntl();
  const {
    handleSuggestionClick, handleUsernameSuggestionClose, usernameSuggestions, errorMessage,
  } = props;
  let className = '';
  let suggestedUsernameDiv = null;
  let iconButton = null;
  const suggestedUsernames = () => (
    <div className={className}>
      <span className="text-gray username-suggestion-label">{formatMessage(messages['registration.username.suggestion.label'])}</span>
      <div className="scroll-suggested-username">
        {usernameSuggestions.map((username, index) => (
          <Button
            type="button"
            name="username"
            variant="outline-dark"
            className="username-suggestion data-hj-suppress"
            autoComplete={props.autoComplete}
            key={`suggestion-${index.toString()}`}
            onClick={(e) => handleSuggestionClick(e, 'username', username)}
          >
            {username}
          </Button>
        ))}
      </div>
      {iconButton}
    </div>
  );
  if (usernameSuggestions.length > 0 && errorMessage && props.value === ' ') {
    className = 'suggested-username-with-error';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => handleUsernameSuggestionClose()} variant="black" size="sm" className="suggested-username-close-button" />;
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && props.value === ' ') {
    className = 'username-suggestions d-flex align-items-center';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => handleUsernameSuggestionClose()} variant="black" size="sm" className="username-suggestions__close__button" />;
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && errorMessage) {
    suggestedUsernameDiv = suggestedUsernames();
  }
  return (
    <FormGroup {...props}>
      {suggestedUsernameDiv}
    </FormGroup>
  );
};

UsernameField.defaultProps = {
  usernameSuggestions: [],
  errorMessage: '',
  autoComplete: null,
};

UsernameField.propTypes = {
  usernameSuggestions: PropTypes.arrayOf(string),
  handleSuggestionClick: PropTypes.func.isRequired,
  handleUsernameSuggestionClose: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
};

export default UsernameField;
