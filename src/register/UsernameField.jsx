import React from 'react';
import PropTypes, { string } from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Button } from '@edx/paragon';

import { FormGroup } from '../common-components';
import messages from './messages';

const UsernameField = (props) => {
  const { intl, usernameSuggestions, errorMessage } = props;

  return (
    <FormGroup {...props}>
      {usernameSuggestions.length > 0 && errorMessage ? (
        <div>
          <span className="text-gray username-suggestion-label">{intl.formatMessage(messages['registration.username.suggestion.label'])}</span>
          {usernameSuggestions.map((username, index) => (
            <Button
              type="button"
              variant="outline-dark"
              className="username-suggestion"
              key={`suggestion-${index.toString()}`}
              onClick={() => props.handleSuggestionClick(username, index)}
            >
              {username}
            </Button>
          ))}
        </div>
      ) : <></>}
    </FormGroup>
  );
};

UsernameField.defaultProps = {
  usernameSuggestions: [],
  handleSuggestionClick: () => {},
  errorMessage: '',
};

UsernameField.propTypes = {
  usernameSuggestions: PropTypes.arrayOf(string),
  handleSuggestionClick: PropTypes.func,
  errorMessage: PropTypes.string,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default injectIntl(UsernameField);
