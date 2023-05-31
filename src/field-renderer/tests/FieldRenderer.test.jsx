import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { mount } from 'enzyme';

import FieldRenderer from '../FieldRenderer';

describe('FieldRendererTests', () => {
  let value = '';

  const changeHandler = (e) => {
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
  };

  beforeEach(() => {
    value = '';
  });

  it('should render select field type', () => {
    const fieldData = {
      type: 'select',
      label: 'Year of Birth',
      name: 'yob-field',
      options: [['1997', '1997'], ['1998', '1998']],
    };

    const fieldRenderer = mount(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const field = fieldRenderer.find('select#yob-field');
    field.simulate('change', { target: { value: 1997 } });

    expect(field.type()).toEqual('select');
    expect(fieldRenderer.find('label').text()).toEqual('Year of Birth');
    expect(value).toEqual(1997);
  });

  it('should return null if no options are provided for select field', () => {
    const fieldData = {
      type: 'select',
      label: 'Year of Birth',
      name: 'yob-field',
    };

    const fieldRenderer = mount(<FieldRenderer fieldData={fieldData} onChangeHandler={() => {}} />);
    expect(fieldRenderer.html()).toBeNull();
  });

  it('should render textarea field', () => {
    const fieldData = {
      type: 'textarea',
      label: 'Why do you want to join this platform?',
      name: 'goals-field',
    };

    const fieldRenderer = mount(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const field = fieldRenderer.find('#goals-field').last();
    field.simulate('change', { target: { value: 'These are my goals.' } });

    expect(field.type()).toEqual('textarea');
    expect(fieldRenderer.find('label').text()).toEqual('Why do you want to join this platform?');
    expect(value).toEqual('These are my goals.');
  });

  it('should render an input field', () => {
    const fieldData = {
      type: 'text',
      label: 'Company',
      name: 'company-field',
    };

    const fieldRenderer = mount(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const field = fieldRenderer.find('#company-field').last();
    field.simulate('change', { target: { value: 'ABC' } });

    expect(field.type()).toEqual('input');
    expect(fieldRenderer.find('label').text()).toEqual('Company');
    expect(value).toEqual('ABC');
  });

  it('should render checkbox field', () => {
    const fieldData = {
      type: 'checkbox',
      label: `I agree that ${getConfig().SITE_NAME} may send me marketing messages.`,
      name: 'marketing-emails-opt-in-field',
    };

    const fieldRenderer = mount(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const field = fieldRenderer.find('input#marketing-emails-opt-in-field');
    field.simulate('change', { target: { checked: true, type: 'checkbox' } });

    expect(field.prop('type')).toEqual('checkbox');
    expect(fieldRenderer.find('label').text()).toEqual(fieldData.label);
    expect(value).toEqual(true);
  });

  it('should return null if field type is unknown', () => {
    const fieldData = {
      type: 'unknown',
    };

    const fieldRenderer = mount(<FieldRenderer fieldData={fieldData} onChangeHandler={() => {}} />);
    expect(fieldRenderer.html()).toBeNull();
  });

  it('should run onBlur and onFocus functions for a field if given', () => {
    const fieldData = { type: 'text', label: 'Test', name: 'test-field' };
    let functionValue = '';

    const onBlur = (e) => {
      functionValue = `${e.target.name} blurred`;
    };

    const onFocus = (e) => {
      functionValue = `${e.target.name} focussed`;
    };

    const fieldRenderer = mount(
      <FieldRenderer
        handleFocus={onFocus}
        handleBlur={onBlur}
        value={value}
        fieldData={fieldData}
        onChangeHandler={changeHandler}
      />,
    );
    const field = fieldRenderer.find('#test-field').last();

    field.simulate('focus');
    expect(functionValue).toEqual('test-field focussed');

    field.simulate('blur');
    expect(functionValue).toEqual('test-field blurred');
  });

  it('should render error message for required text fields', () => {
    const fieldData = { type: 'text', label: 'First Name', name: 'first-name-field' };

    const fieldRenderer = mount(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Enter your first name"
      />,
    );

    expect(fieldRenderer.find('.form-text-size').last().text()).toEqual('Enter your first name');
  });

  it('should render error message for required select fields', () => {
    const fieldData = {
      type: 'select', label: 'Preference', name: 'preference-field', options: [['a', 'Opt 1'], ['b', 'Opt 2']],
    };

    const fieldRenderer = mount(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Select your preference"
      />,
    );

    expect(fieldRenderer.find('.form-text-size').last().text()).toEqual('Select your preference');
  });

  it('should render error message for required textarea fields', () => {
    const fieldData = { type: 'textarea', label: 'Goals', name: 'goals-field' };

    const fieldRenderer = mount(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Tell us your goals"
      />,
    );

    expect(fieldRenderer.find('.form-text-size').last().text()).toEqual('Tell us your goals');
  });

  it('should render error message for required checkbox fields', () => {
    const fieldData = { type: 'checkbox', label: 'Honor Code', name: 'honor-code-field' };

    const fieldRenderer = mount(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="You must agree to our Honor Code"
      />,
    );

    expect(fieldRenderer.find('.form-text-size').last().text()).toEqual('You must agree to our Honor Code');
  });
});
