import React from 'react';
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
      options: [['1997', 1997], ['1998', 1998]],
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
      label: 'I agree that edX may send me marketing messages.',
      name: 'marketing-emails-opt-in-field',
    };

    const fieldRenderer = mount(<FieldRenderer value={value} fieldData={fieldData} onChangeHandler={changeHandler} />);
    const field = fieldRenderer.find('input#marketing-emails-opt-in-field');
    field.simulate('change', { target: { checked: true, type: 'checkbox' } });

    expect(field.prop('type')).toEqual('checkbox');
    expect(fieldRenderer.find('label').text()).toEqual('I agree that edX may send me marketing messages.');
    expect(value).toEqual(true);
  });

  it('should return null if field type is unknown', () => {
    const fieldData = {
      type: 'unknown',
    };

    const fieldRenderer = mount(<FieldRenderer fieldData={fieldData} onChangeHandler={() => {}} />);
    expect(fieldRenderer.html()).toBeNull();
  });
});
