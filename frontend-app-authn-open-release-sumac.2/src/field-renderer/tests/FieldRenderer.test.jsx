import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { fireEvent, render } from '@testing-library/react';

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

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('select#yob-field');
    const label = container.querySelector('label');
    fireEvent.change(input, { target: { value: 1997 } });

    expect(input.type).toEqual('select-one');
    expect(label.textContent).toContain(fieldData.label);
    expect(value).toEqual('1997');
  });

  it('should return null if no options are provided for select field', () => {
    const fieldData = {
      type: 'select',
      label: 'Year of Birth',
      name: 'yob-field',
    };

    const { container } = render(<FieldRenderer fieldData={fieldData} onChangeHandler={() => {}} />);
    expect(container.innerHTML).toEqual('');
  });

  it('should render textarea field', () => {
    const fieldData = {
      type: 'textarea',
      label: 'Why do you want to join this platform?',
      name: 'goals-field',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('#goals-field');
    const label = container.querySelector('label');
    fireEvent.change(input, { target: { value: 'These are my goals.' } });

    expect(input.type).toEqual(fieldData.type);
    expect(label.textContent).toContain('Why do you want to join this platform?');
    expect(value).toEqual('These are my goals.');
  });

  it('should render an input field', () => {
    const fieldData = {
      type: 'text',
      label: 'Company',
      name: 'company-field',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#company-field');
    const label = container.querySelector('label');
    fireEvent.change(input, { target: { value: 'ABC' } });

    expect(input.type).toEqual(fieldData.type);
    expect(label.textContent).toContain(fieldData.label);
    expect(value).toEqual('ABC');
  });

  it('should render checkbox field', () => {
    const fieldData = {
      type: 'checkbox',
      label: `I agree that ${getConfig().SITE_NAME} may send me marketing messages.`,
      name: 'marketing-emails-opt-in-field',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#marketing-emails-opt-in-field');
    const label = container.querySelector('label');
    fireEvent.click(input);

    expect(input.type).toEqual(fieldData.type);
    expect(label.textContent).toContain(fieldData.label);
    expect(value).toEqual(true);
  });

  it('should return null if field type is unknown', () => {
    const fieldData = {
      type: 'unknown',
    };

    const { container } = render(<FieldRenderer fieldData={fieldData} onChangeHandler={() => {}} />);
    expect(container.innerHTML).toContain('');
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

    const { container } = render(
      <FieldRenderer
        handleFocus={onFocus}
        handleBlur={onBlur}
        value={value}
        fieldData={fieldData}
        onChangeHandler={changeHandler}
      />,
    );
    const input = container.querySelector('#test-field');

    fireEvent.focus(input);
    expect(functionValue).toEqual('test-field focussed');

    fireEvent.blur(input);
    expect(functionValue).toEqual('test-field blurred');
  });

  it('should render error message for required text fields', () => {
    const fieldData = { type: 'text', label: 'First Name', name: 'first-name-field' };

    const { container } = render(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Enter your first name"
      />,
    );

    expect(container.querySelector(`#${fieldData.name}-error`).textContent).toEqual('Enter your first name');
  });

  it('should render error message for required select fields', () => {
    const fieldData = {
      type: 'select', label: 'Preference', name: 'preference-field', options: [['a', 'Opt 1'], ['b', 'Opt 2']],
    };

    const { container } = render(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Select your preference"
      />,
    );

    expect(container.querySelector(`#${fieldData.name}-error`).textContent).toEqual('Select your preference');
  });

  it('should render error message for required textarea fields', () => {
    const fieldData = { type: 'textarea', label: 'Goals', name: 'goals-field' };

    const { container } = render(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="Tell us your goals"
      />,
    );

    expect(container.querySelector(`#${fieldData.name}-error`).textContent).toEqual('Tell us your goals');
  });

  it('should render error message for required checkbox fields', () => {
    const fieldData = { type: 'checkbox', label: 'Honor Code', name: 'honor-code-field' };

    const { container } = render(
      <FieldRenderer
        isRequired
        fieldData={fieldData}
        onChangeHandler={changeHandler}
        errorMessage="You must agree to our Honor Code"
      />,
    );

    expect(container.querySelector(`#${fieldData.name}-error`).textContent).toEqual('You must agree to our Honor Code');
  });
});
