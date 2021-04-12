import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import {
  IconButton, useToggle, Tooltip, OverlayTrigger, Icon,
} from '@edx/paragon';
import { Check, Remove } from '@edx/paragon/icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import FormGroup from './FormGroup';
import messages from './messages';
import { LETTER_REGEX, NUMBER_REGEX } from '../data/constants';

const PasswordField = (props) => {
  const { formatMessage } = props.intl;
  const [isPasswordHidden, setHiddenTrue, setHiddenFalse] = useToggle(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBlur = (e) => {
    props.handleBlur(e);
    setShowTooltip(false);
  };

  const HideButton = (
    <IconButton icon={faEyeSlash} onClick={setHiddenTrue} alt={formatMessage(messages['hide.password'])} aria-label={formatMessage(messages['hide.password'])} />
  );

  const ShowButton = (
    <IconButton icon={faEye} onClick={setHiddenFalse} alt={formatMessage(messages['show.password'])} aria-label={formatMessage(messages['show.password'])} />
  );

  const tooltip = (
    <Tooltip id="password-requirement">
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
    <OverlayTrigger key="tooltip" placement="left" overlay={tooltip} show={showTooltip}>
      <FormGroup
        {...props}
        handleFocus={() => setShowTooltip(true)}
        handleBlur={handleBlur}
        type={isPasswordHidden ? 'password' : 'text'}
        trailingElement={isPasswordHidden ? ShowButton : HideButton}
      />
    </OverlayTrigger>
  );
};

PasswordField.defaultProps = {
  errorMessage: '',
  handleBlur: null,
  handleChange: () => {},
};

PasswordField.propTypes = {
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default injectIntl(PasswordField);
