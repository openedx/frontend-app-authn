import React from 'react';
import PropTypes, { string } from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { connect } from 'react-redux';

import { Button } from '@edx/paragon';

import { usernameSuggestionsSelector } from './data/selectors';
import { FormGroup } from '../common-components';
import messages from './messages';

const UsernameField = (props) => {
  const { intl, usernameSuggestions } = props;

  return (
    <FormGroup {...props}>
      {usernameSuggestions.length > 0 ? (
        <div>
          <span className="text-gray mr-2">{intl.formatMessage(messages['registration.username.suggestion.label'])}</span>
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
};

UsernameField.propTypes = {
  usernameSuggestions: PropTypes.arrayOf(string),
  handleSuggestionClick: PropTypes.func,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  usernameSuggestions: usernameSuggestionsSelector(state),
});

export default connect(
  mapStateToProps,
)(injectIntl(UsernameField));
