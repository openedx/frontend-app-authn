import React from 'react';
import PropTypes, { string } from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Button, IconButton, Icon } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';

import { FormGroup } from '../common-components';
import messages from './messages';

const UsernameField = (props) => {
  const { intl, usernameSuggestions, errorMessage } = props;
  let className = '';
  let suggestedUsernameDiv = <></>;
  let iconButton = <></>;
  const suggestedUsernames = () => (
    <div className={className}>
      <span className="text-gray username-suggestion-label">{intl.formatMessage(messages['registration.username.suggestion.label'])}</span>
      {usernameSuggestions.map((username, index) => (
        <Button
          type="button"
          name="username"
          variant="outline-dark"
          className="username-suggestion data-hj-suppress"
          key={`suggestion-${index.toString()}`}
          onClick={(e) => props.handleSuggestionClick(e, username)}
        >
          {username}
        </Button>
      ))}
      {iconButton}
    </div>
  );
  if (usernameSuggestions.length > 0 && errorMessage && props.value === ' ') {
    className = 'suggested-username-with-error';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => props.handleUsernameSuggestionClose()} variant="black" size="sm" className="suggested-username-close-button" />;
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && props.value === ' ') {
    className = 'suggested-username';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => props.handleUsernameSuggestionClose()} variant="black" size="sm" className="suggested-username-close-button" />;
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
  handleSuggestionClick: () => {},
  handleUsernameSuggestionClose: () => {},
  errorMessage: '',
};

UsernameField.propTypes = {
  usernameSuggestions: PropTypes.arrayOf(string),
  handleSuggestionClick: PropTypes.func,
  handleUsernameSuggestionClose: PropTypes.func,
  errorMessage: PropTypes.string,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default injectIntl(UsernameField);
