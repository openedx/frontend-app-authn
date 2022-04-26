import React from 'react';

import PropTypes from 'prop-types';
import { Form, Icon } from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';

const FormFieldRenderer = (props) => {
  let formField = null;
  const {
    errorMessage, fieldData, onChangeHandler, isRequired, value,
  } = props;

  const handleFocus = (e) => {
    if (props.handleFocus) { props.handleFocus(e); }
  };

  const handleOnBlur = (e) => {
    if (props.handleBlur) { props.handleBlur(e); }
  };

  switch (fieldData.type) {
    case 'select': {
      if (!fieldData.options) {
        return null;
      }
      formField = (
        <Form.Group controlId={fieldData.name} isInvalid={isRequired && errorMessage}>
          <Form.Control
            as="select"
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={(e) => onChangeHandler(e)}
            trailingElement={<Icon src={ExpandMore} />}
            floatingLabel={fieldData.label}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          >
            <option key="default" value="">{fieldData.label}</option>
            {fieldData.options.map(option => (
              <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
            ))}
          </Form.Control>
          {isRequired && errorMessage && (
            <Form.Control.Feedback id={`${fieldData.name}-error`} type="invalid" className="form-text-size" hasIcon={false}>
              {errorMessage}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      );
      break;
    }
    case 'textarea': {
      formField = (
        <Form.Group controlId={fieldData.name} isInvalid={isRequired && errorMessage}>
          <Form.Control
            as="textarea"
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={(e) => onChangeHandler(e)}
            floatingLabel={fieldData.label}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          />
          {isRequired && errorMessage && (
            <Form.Control.Feedback id={`${fieldData.name}-error`} type="invalid" className="form-text-size" hasIcon={false}>
              {errorMessage}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      );
      break;
    }
    case 'text': {
      formField = (
        <Form.Group controlId={fieldData.name} isInvalid={isRequired && errorMessage}>
          <Form.Control
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={(e) => onChangeHandler(e)}
            floatingLabel={fieldData.label}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          />
          {isRequired && errorMessage && (
            <Form.Control.Feedback id={`${fieldData.name}-error`} type="invalid" className="form-text-size" hasIcon={false}>
              {errorMessage}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      );
      break;
    }
    case 'checkbox': {
      formField = (
        <Form.Group isInvalid={isRequired && errorMessage}>
          <Form.Checkbox
            id={fieldData.name}
            checked={!!value}
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={(e) => onChangeHandler(e)}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          >
            {fieldData.label}
          </Form.Checkbox>
          {isRequired && errorMessage && (
            <Form.Control.Feedback id={`${fieldData.name}-error`} type="invalid" className="form-text-size" hasIcon={false}>
              {errorMessage}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      );
      break;
    }
    default:
      break;
  }

  return formField;
};
FormFieldRenderer.defaultProps = {
  value: '',
  handleBlur: null,
  handleFocus: null,
  errorMessage: '',
  isRequired: false,
};

FormFieldRenderer.propTypes = {
  fieldData: PropTypes.shape({
    type: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  errorMessage: PropTypes.string,
  isRequired: PropTypes.bool,
  value: PropTypes.string,
};

export default FormFieldRenderer;
