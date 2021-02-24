import React from 'react';
import { mount } from 'enzyme';

import AuthnCustomValidationFormGroup from '../AuthnValidationFormGroup';

describe('AuthnCustomValidationFormGroup', () => {
  let props = {
    label: 'Email Label',
    for: 'email',
    name: 'email',
    type: 'email',
    value: '',
    helpText: 'Email field help text',
  };

  it('should show label in place of placeholder when field is empty', () => {
    const validationFormGroup = mount(<AuthnCustomValidationFormGroup {...props} />);
    expect(validationFormGroup.find('label').prop('className')).toEqual('pt-10 focus-out form-label');
  });

  it('should show label on top of field when field is focused in', () => {
    const validationFormGroup = mount(<AuthnCustomValidationFormGroup {...props} />);

    validationFormGroup.find('input').simulate('focus');
    expect(validationFormGroup.find('label').prop('className')).toEqual('pt-10 h6 form-label');
  });

  it('should keep label hidden for checkbox field', () => {
    props = {
      ...props,
      type: 'checkbox',
      optionalFieldCheckbox: true,
    };
    const validationFormGroup = mount(<AuthnCustomValidationFormGroup {...props} />);
    expect(validationFormGroup.find('label').prop('className')).toEqual('sr-only form-label');
  });

  it('should keep label hidden when input field is not empty', () => {
    props = {
      ...props,
      value: 'test',
    };
    const validationFormGroup = mount(<AuthnCustomValidationFormGroup {...props} />);
    expect(validationFormGroup.find('label').prop('className')).toEqual('sr-only form-label');
  });
});
