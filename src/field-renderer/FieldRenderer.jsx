import React from 'react';

import PropTypes from 'prop-types';
import { Form, Icon } from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';

const FormFieldRenderer = (props) => {
  let formField = null;
  const { fieldData, onChangeHandler, value } = props;

  switch (fieldData.type) {
    case 'select': {
      if (!fieldData.options) {
        return null;
      }
      formField = (
        <Form.Group controlId={fieldData.name} className="mb-3">
          <Form.Control
            as="select"
            name={fieldData.name}
            value={value}
            onChange={(e) => onChangeHandler(e)}
            trailingElement={<Icon src={ExpandMore} />}
            floatingLabel={fieldData.label}
          >
            <option key="default" value="">{fieldData.label}</option>
            {fieldData.options.map(option => (
              <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
            ))}
          </Form.Control>
        </Form.Group>
      );
      break;
    }
    case 'textarea': {
      formField = (
        <Form.Group controlId={fieldData.name} className="mb-3">
          <Form.Control
            as="textarea"
            name={fieldData.name}
            value={value}
            onChange={(e) => onChangeHandler(e)}
            floatingLabel={fieldData.label}
          />
        </Form.Group>
      );
      break;
    }
    case 'text': {
      formField = (
        <Form.Group controlId={fieldData.name} className="mb-3">
          <Form.Control
            name={fieldData.name}
            value={value}
            onChange={(e) => onChangeHandler(e)}
            floatingLabel={fieldData.label}
          />
        </Form.Group>
      );
      break;
    }
    case 'checkbox': {
      formField = (
        <Form.Group className="mb-3">
          <Form.Checkbox
            id={fieldData.name}
            checked={!!value}
            name={fieldData.name}
            value={value}
            onChange={(e) => onChangeHandler(e)}
          >
            {fieldData.label}
          </Form.Checkbox>
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
};

FormFieldRenderer.propTypes = {
  fieldData: PropTypes.shape({
    type: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default FormFieldRenderer;
