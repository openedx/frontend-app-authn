import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon, IconButton } from '@edx/paragon';
import { Close } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import { FormGroup } from '../../common-components';
import { clearUsernameSuggestions } from '../data/actions';
import messages from '../messages';

const UsernameField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const {
    value,
    errorMessage,
    handleChange,
    handleFocus,
  } = props;
  let className = '';
  let suggestedUsernameDiv = null;
  let iconButton = null;
  const usernameSuggestions = useSelector(state => state.register.usernameSuggestions);

  /**
   * We need to remove the placeholder from the field, adding a space will do that.
   * This is needed because we are placing the username suggestions on top of the field.
   */
  useEffect(() => {
    if (usernameSuggestions.length && !value) {
      handleChange({ target: { name: 'username', value: ' ' } });
    }
  }, [handleChange, usernameSuggestions, value]);

  const handleOnChange = (event) => {
    let username = event.target.value;
    if (username.length > 30) {
      return;
    }
    if (event.target.value.startsWith(' ')) {
      username = username.trim();
    }
    handleChange({ target: { name: 'username', value: username } });
  };

  const handleOnFocus = (event) => {
    const username = event.target.value;
    dispatch(clearUsernameSuggestions());
    // If we added a space character to username field to display the suggestion
    // remove it before user enters the input. This is to ensure user doesn't
    // have a space prefixed to the username.
    if (username === ' ') {
      handleChange({ target: { name: 'username', value: '' } });
    }
    handleFocus({ target: { name: 'username', value: username } });
  };

  const handleSuggestionClick = (event, fieldName, suggestion = '') => {
    event.preventDefault();
    handleFocus({ target: { name: 'username', value: suggestion } }); // to clear the error if any
    handleChange({ target: { name: 'username', value: suggestion } }); // to set suggestion as value
    dispatch(clearUsernameSuggestions());
  };

  const handleUsernameSuggestionClose = () => dispatch(clearUsernameSuggestions());

  const suggestedUsernames = () => (
    <div className={className}>
      <span className="text-gray username-suggestion--label">{formatMessage(messages['registration.username.suggestion.label'])}</span>
      <div className="username-scroll-suggested--form-field">
        {usernameSuggestions.map((username, index) => (
          <Button
            type="button"
            name="username"
            variant="outline-dark"
            className="username-suggestions--chip data-hj-suppress"
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

  if (usernameSuggestions.length > 0 && errorMessage && value === ' ') {
    className = 'username-suggestions__error';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => handleUsernameSuggestionClose()} variant="black" size="sm" className="username-suggestions__close__button" />;
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && value === ' ') {
    className = 'username-suggestions d-flex align-items-center';
    iconButton = <IconButton src={Close} iconAs={Icon} alt="Close" onClick={() => handleUsernameSuggestionClose()} variant="black" size="sm" className="username-suggestions__close__button" />;
    suggestedUsernameDiv = suggestedUsernames();
  } else if (usernameSuggestions.length > 0 && errorMessage) {
    suggestedUsernameDiv = suggestedUsernames();
  }
  return (
    <FormGroup {...props} handleChange={handleOnChange} handleFocus={handleOnFocus}>
      {suggestedUsernameDiv}
    </FormGroup>
  );
};

UsernameField.defaultProps = {
  errorMessage: '',
  autoComplete: null,
};

UsernameField.propTypes = {
  handleChange: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
};

export default UsernameField;
