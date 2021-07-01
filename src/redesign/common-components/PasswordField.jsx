import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  Form, IconButton, useToggle, Tooltip, OverlayTrigger, Icon,
} from '@edx/paragon';
import {
  Check, Remove, Visibility, VisibilityOff,
} from '@edx/paragon/icons';

import messages from './messages';
import { LETTER_REGEX, NUMBER_REGEX } from '../data/constants';

const PasswordField = (props) => {
  const { formatMessage } = props.intl;
  const [isPasswordHidden, setHiddenTrue, setHiddenFalse] = useToggle(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBlur = (e) => {
    if (props.handleBlur) { props.handleBlur(e); }
    setShowTooltip(props.showRequirements && false);
  };

  const handleFocus = (e) => {
    if (props.handleFocus) {
      props.handleFocus(e);
    }
    setTimeout(() => setShowTooltip(props.showRequirements && true), 150);
  };

  const HideButton = (
    <IconButton onFocus={handleFocus} onBlur={handleBlur} name="passwordValidation" src={VisibilityOff} iconAs={Icon} onClick={setHiddenTrue} size="sm" variant="secondary" alt={formatMessage(messages['hide.password'])} />
  );

  const ShowButton = (
    <IconButton onFocus={handleFocus} onBlur={handleBlur} name="passwordValidation" src={Visibility} iconAs={Icon} onClick={setHiddenFalse} size="sm" variant="secondary" alt={formatMessage(messages['show.password'])} />
  );
  const placement = window.innerWidth < 768 ? 'top' : 'left';
  const tooltip = (
    <Tooltip id={`password-requirement-${placement}`}>
      <span id="letter-check" className="d-flex position-relative align-content-start">
        {LETTER_REGEX.test(props.value) ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1" src={Remove} />}
        {formatMessage(messages['one.letter'])}
      </span>
      <span id="number-check" className="d-flex position-relative align-content-start">
        {NUMBER_REGEX.test(props.value) ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1" src={Remove} />}
        {formatMessage(messages['one.number'])}
      </span>
      <span id="characters-check" className="d-flex position-relative align-content-start">
        {props.value.length >= 8 ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1" src={Remove} />}
        {formatMessage(messages['eight.characters'])}
      </span>
    </Tooltip>
  );

  return (
    <Form.Group controlId={props.name} isInvalid={props.errorMessage !== ''}>
      <OverlayTrigger key="tooltip" placement={placement} overlay={tooltip} show={showTooltip}>
        <Form.Control
          as="input"
          type={isPasswordHidden ? 'password' : 'text'}
          name={props.name}
          value={props.value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={props.handleChange}
          controlClassName={props.borderClass}
          trailingElement={isPasswordHidden ? ShowButton : HideButton}
          floatingLabel={props.floatingLabel}
        />
      </OverlayTrigger>
      {props.errorMessage !== '' && (
        <Form.Control.Feedback key="error" hasIcon={false} feedback-for={props.name} type="invalid">
          {props.errorMessage}
          <span className="sr-only">{formatMessage(messages['password.sr.only.helping.text'])}</span>
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

PasswordField.defaultProps = {
  borderClass: '',
  errorMessage: '',
  handleBlur: null,
  handleFocus: null,
  handleChange: () => {},
  showRequirements: true,
};

PasswordField.propTypes = {
  borderClass: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool,
  value: PropTypes.string.isRequired,
};

export default injectIntl(PasswordField);
