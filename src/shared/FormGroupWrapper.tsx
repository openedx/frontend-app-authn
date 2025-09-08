/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { Form, TransitionReplace } from '@openedx/paragon';

import { cn } from '../utils/cn';

interface FormGroupProps {
    label: string;
    name: string;
    value: string;
    as?: string;
    autoComplete?: string;
    borderClass?: string;
    children?: React.ReactElement;
    className?: string;
    errorMessage?: string;
    handleBlur?: (e?: React.FocusEvent<any>) => void;
    handleChange?: (e?: React.ChangeEvent<any>) => void;
    handleClick?: (e?: React.MouseEvent<any>) => void;
    handleFocus?: (e?: React.FocusEvent<any>) => void;
    helpText?: string[];
    options?: () => React.ReactNode;
    readOnly?: boolean;
    spellCheck?: string;
    trailingElement?: React.ReactElement;
    type?: string;
    placeholder?: string;
  }

const FormGroupWrapper = (props: FormGroupProps) => {
  const [hasFocus, setHasFocus] = useState(false);
  const handleFocus = (e: React.FocusEvent<any>) => {
    setHasFocus(true);
    if (props.handleFocus) { props.handleFocus(e); }
  };

  const handleClick = (e: React.MouseEvent<any>) => {
    if (props.handleClick) { props.handleClick(e); }
  };

  const handleOnBlur = (e: React.FocusEvent<any>) => {
    setHasFocus(false);
    if (props.handleBlur) { props.handleBlur(e); }
  };

  const Label = props.label && <p className="tw-text-gray-700 tw-text-[14px] tw-font-[500] tw-leading-[24px] tw-mb-[6px]">{props.label}</p>;

  return (
    <div>
      {Label}
      <Form.Group controlId={props.name} className={cn(props.className)} isInvalid={props.errorMessage !== ''}>
        <Form.Control
          as={props.as}
          readOnly={props.readOnly}
          type={props.type}
          aria-invalid={props.errorMessage !== ''}
          className="form-group__form-field tw-rounded-[8px] tw-border-gray-300 tw-shadow-xs"
          autoComplete={props.autoComplete}
          spellCheck={props.spellCheck}
          name={props.name}
          value={props.value}
          onFocus={handleFocus}
          onBlur={handleOnBlur}
          onClick={handleClick}
          onChange={props.handleChange}
          controlClassName={`${props.borderClass} tw-rounded-[8px] tw-border-gray-300 tw-shadow-xs tw-py-[10px] tw-px-[14px]`}
          trailingElement={props.trailingElement}
          placeholder={props.placeholder}
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
    </div>
  );
};

export default FormGroupWrapper;
