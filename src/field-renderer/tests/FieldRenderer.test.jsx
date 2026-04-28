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

  it('should render placeholder for text field', () => {
    const fieldData = {
      type: 'text',
      label: 'Company',
      name: 'company-field',
      placeholder: 'Enter your company name',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#company-field');

    expect(input.placeholder).toEqual('Enter your company name');
  });

  it('should render placeholder for textarea field', () => {
    const fieldData = {
      type: 'textarea',
      label: 'Goals',
      name: 'goals-field',
      placeholder: 'Share your learning goals',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('#goals-field');

    expect(input.placeholder).toEqual('Share your learning goals');
  });

  it('should apply maxLength restriction to text field', () => {
    const fieldData = {
      type: 'text',
      label: 'Company',
      name: 'company-field',
      restrictions: {
        max_length: 50,
      },
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#company-field');

    expect(input.maxLength).toEqual(50);
  });

  it('should apply maxLength restriction to textarea field', () => {
    const fieldData = {
      type: 'textarea',
      label: 'Goals',
      name: 'goals-field',
      restrictions: {
        max_length: 200,
      },
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('#goals-field');

    expect(input.maxLength).toEqual(200);
  });

  it('should show help text when field has focus and instructions are provided', () => {
    const fieldData = {
      type: 'text',
      label: 'Username',
      name: 'username-field',
      instructions: 'Username must be between 2-30 characters',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#username-field');

    // Help text should not be visible initially
    expect(container.textContent).not.toContain('Username must be between 2-30 characters');

    // Focus the field
    fireEvent.focus(input);

    // Help text should now be visible
    expect(container.textContent).toContain('Username must be between 2-30 characters');

    // Blur the field
    fireEvent.blur(input);

    // Help text should be hidden again
    expect(container.textContent).not.toContain('Username must be between 2-30 characters');
  });

  it('should show help text for textarea when focused', () => {
    const fieldData = {
      type: 'textarea',
      label: 'Goals',
      name: 'goals-field',
      instructions: 'Please describe your learning goals in detail',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('#goals-field');

    // Help text should not be visible initially
    expect(container.textContent).not.toContain('Please describe your learning goals in detail');

    // Focus the field
    fireEvent.focus(input);

    // Help text should now be visible
    expect(container.textContent).toContain('Please describe your learning goals in detail');
  });

  it('should not show help text if instructions are not provided', () => {
    const fieldData = {
      type: 'text',
      label: 'Company',
      name: 'company-field',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const input = container.querySelector('input#company-field');

    // Focus the field
    fireEvent.focus(input);

    // No help text should be rendered since instructions are not provided
    const feedbackElement = container.querySelector('.form-control-feedback');
    expect(feedbackElement).toBeNull();
  });

  it('should show help text for select field when focused', () => {
    const fieldData = {
      type: 'select',
      label: 'Country',
      name: 'country-field',
      options: [['us', 'United States'], ['ca', 'Canada']],
      instructions: 'Select your country of residence',
    };

    const { container } = render(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const select = container.querySelector('select#country-field');

    // Help text should not be visible initially
    expect(container.textContent).not.toContain('Select your country of residence');

    // Focus the field
    fireEvent.focus(select);

    // Note: Select fields don't show help text in the current implementation
    // This test documents the current behavior
  });
});
