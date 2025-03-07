import React, { useState } from 'react';

import {
  Form, TransitionReplace,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

const FormGroup = (props) => {
  const [hasFocus, setHasFocus] = useState(false);

  const handleFocus = (e) => {
    setHasFocus(true);
    if (props.handleFocus) { props.handleFocus(e); }
  };
  const handleClick = (e) => {
    if (props.handleClick) { props.handleClick(e); }
  };
  const handleOnBlur = (e) => {
    setHasFocus(false);
    if (props.handleBlur) { props.handleBlur(e); }
  };

  return (
    <Form.Group controlId={props.name} className={props.className} isInvalid={props.errorMessage !== ''}>
      <Form.Control
        as={props.as}
        readOnly={props.readOnly}
        type={props.type}
        aria-invalid={props.errorMessage !== ''}
        className="form-group__form-field"
        autoComplete={props.autoComplete}
        spellCheck={props.spellCheck}
        name={props.name}
        value={props.value}
        onFocus={handleFocus}
        onBlur={handleOnBlur}
        onClick={handleClick}
        onChange={props.handleChange}
        controlClassName={props.borderClass}
        trailingElement={props.trailingElement}
        floatingLabel={props.floatingLabel}
      >
        {props.options ? props.options() : null}
      </Form.Control>
      <TransitionReplace>
        {hasFocus && props.helpText ? (
          <Form.Control.Feedback type="default" key="help-text" className="d-block form-text-size">
            {props.helpText.map((message, index) => (
              <span key={`help-text-${index.toString()}`}>
                {message}
                <br />
              </span>
            ))}
          </Form.Control.Feedback>
        ) : <div key="empty" />}
      </TransitionReplace>
      {props.errorMessage !== '' && (
        <Form.Control.Feedback key="error" className="form-text-size" hasIcon={false} feedback-for={props.name} type="invalid">{props.errorMessage}</Form.Control.Feedback>
      )}
      {props.children}
    </Form.Group>
  );
};

FormGroup.defaultProps = {
  as: 'input',
  autoComplete: null,
  borderClass: '',
  children: null,
  className: '',
  errorMessage: '',
  handleBlur: null,
  handleChange: () => {},
  handleClick: null,
  handleFocus: null,
  helpText: [],
  options: null,
  readOnly: false,
  spellCheck: null,
  trailingElement: null,
  type: 'text',
};

FormGroup.propTypes = {
  as: PropTypes.string,
  autoComplete: PropTypes.string,
  borderClass: PropTypes.string,
  children: PropTypes.element,
  className: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleClick: PropTypes.func,
  handleFocus: PropTypes.func,
  helpText: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  options: PropTypes.func,
  readOnly: PropTypes.bool,
  spellCheck: PropTypes.string,
  trailingElement: PropTypes.element,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
};

export default FormGroup;
