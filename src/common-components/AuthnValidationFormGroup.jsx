import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  ValidationFormGroup,
} from '@edx/paragon';

const AuthnCustomValidationFormGroup = (props) => {
  const { onClick, onChange, onBlur } = props;
  const [showHelpText, setShowHelpText] = useState(false);
  const [showLabelText, setShowLabelText] = useState(false);

  // handler code that need to be invoked via input
  const onClickHandler = (e, clickCb) => {
    setShowHelpText(true);
    setShowLabelText(true);
    if (clickCb) {
      clickCb(e);
    }
  };
  const onBlurHandler = (e, blurCb) => {
    setShowHelpText(false);
    setShowLabelText(false);
    if (blurCb) {
      blurCb(e);
    }
  };
  const onChangeHandler = (e, changeCb) => {
    if (changeCb) {
      changeCb(e);
    }
  };
  const onOptionalHandler = (e, clickCb) => { clickCb(e); };

  const showLabel = () => {
    let className;
    if (props.optionalFieldCheckbox || (!showLabelText && (props.value !== '' || props.type === 'select'))) {
      className = 'sr-only';
    } else if (showLabelText) {
      className = 'pt-10 h6';
    } else {
      className = 'pt-10 focus-out';
    }

    return (
      <Form.Label htmlFor={props.for} className={className}>{props.label}</Form.Label>
    );
  };
  const showOptional = () => {
    const additionalField = props.optionalFieldCheckbox ? (
      <p role="presentation" id="additionalFields" className="mb-1 small" onClick={(e) => onOptionalHandler(e, onClick)}>
        {props.checkboxMessage}
      </p>
    ) : <span />;
    return additionalField;
  };

  const inputProps = {
    name: props.name,
    id: props.for,
    type: props.type,
    value: props.value,
    className: props.inputFieldStyle,
    'aria-invalid': props.ariaInvalid,
    autoComplete: 'on',
  };
  inputProps.onChange = (e) => onChangeHandler(e, onChange);
  inputProps.onClick = (e) => onClickHandler(e, onClick);
  inputProps.onBlur = (e) => onBlurHandler(e, onBlur);
  inputProps.onFocus = (e) => onClickHandler(e, null);

  if (props.type === 'select') {
    inputProps.options = props.selectOptions;
    inputProps.className = props.value === '' ? `${props.inputFieldStyle} text-muted` : props.inputFieldStyle;
  }
  if (props.type === 'checkbox') {
    inputProps.checked = props.isChecked;
  }

  const validationGroupProps = {
    for: props.for,
  };
  if (!props.optionalFieldCheckbox) {
    validationGroupProps.invalid = props.invalid;
    validationGroupProps.invalidMessage = props.invalidMessage;
    validationGroupProps.helpText = showHelpText ? props.helpText : '';
  } else {
    validationGroupProps.className = props.optionalFieldCheckbox ? 'custom-control pt-10 mb-0' : '';
  }
  if (props.className) {
    validationGroupProps.className = props.className;
  }

  return (
    <ValidationFormGroup
      {...validationGroupProps}
    >
      {showLabel()}
      <Input
        {...inputProps}
        required
      />
      {showOptional()}
    </ValidationFormGroup>
  );
};

AuthnCustomValidationFormGroup.defaultProps = {
  name: '',
  for: '',
  label: '',
  optionalFieldCheckbox: false,
  type: '',
  value: '',
  invalid: false,
  ariaInvalid: false,
  invalidMessage: '',
  inputFieldStyle: '',
  helpText: '',
  className: '',
  onClick: null,
  onBlur: null,
  onChange: null,
  isChecked: false,
  checkboxMessage: '',
  selectOptions: null,
};

AuthnCustomValidationFormGroup.propTypes = {
  name: PropTypes.string,
  for: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  invalid: PropTypes.bool,
  ariaInvalid: PropTypes.bool,
  invalidMessage: PropTypes.string,
  helpText: PropTypes.string,
  className: PropTypes.string,
  inputFieldStyle: PropTypes.string,
  isChecked: PropTypes.bool,
  optionalFieldCheckbox: PropTypes.bool,
  onClick: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  checkboxMessage: PropTypes.string,
  selectOptions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string,
  })),
};

export default AuthnCustomValidationFormGroup;
