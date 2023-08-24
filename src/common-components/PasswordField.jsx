import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, Icon, IconButton, OverlayTrigger, Tooltip, useToggle,
} from '@edx/paragon';
import {
  Check, Remove, Visibility, VisibilityOff,
} from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';
import { LETTER_REGEX, NUMBER_REGEX } from '../data/constants';
import { clearRegistertionBackendError, fetchRealtimeValidations } from '../register/data/actions';
import { PASSWORD_FIELD_LABEL } from '../register/data/constants';
import { validatePasswordField } from '../register/data/utils';

const PasswordField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);
  const [isPasswordHidden, setHiddenTrue, setHiddenFalse] = useToggle(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleBlur = (e) => {
    if (e.target?.name === PASSWORD_FIELD_LABEL && e.relatedTarget?.name === 'passwordIcon') {
      return; // resolving a bug where validations get run on password icon focus
    }

    if (props.handleBlur) { props.handleBlur(e); }
    setShowTooltip(props.showRequirements && false);
    if (props.handleErrorChange) { // If rendering from register page
      const fieldError = validatePasswordField(props.value, formatMessage);
      if (fieldError) {
        props.handleErrorChange(PASSWORD_FIELD_LABEL, fieldError);
      } else if (!validationApiRateLimited) {
        dispatch(fetchRealtimeValidations({ [PASSWORD_FIELD_LABEL]: props.value }));
      }
    }
  };

  const handleFocus = (e) => {
    if (e.target?.name === 'passwordIcon') {
      return; // resolving a bug where error gets cleared on password icon focus
    }

    if (props.handleFocus) {
      props.handleFocus(e);
    }
    if (props.handleErrorChange) {
      props.handleErrorChange(PASSWORD_FIELD_LABEL, '');
      dispatch(clearRegistertionBackendError(PASSWORD_FIELD_LABEL));
    }
    setTimeout(() => setShowTooltip(props.showRequirements && true), 150);
  };

  const HideButton = (
    <IconButton
      onFocus={handleFocus}
      onBlur={handleBlur}
      name="passwordIcon"
      src={VisibilityOff}
      iconAs={Icon}
      onClick={setHiddenTrue}
      size="sm"
      variant="secondary"
      alt={formatMessage(messages['hide.password'])}
    />
  );

  const ShowButton = (
    <IconButton
      onFocus={handleFocus}
      onBlur={handleBlur}
      name="passwordIcon"
      src={Visibility}
      iconAs={Icon}
      onClick={setHiddenFalse}
      size="sm"
      variant="secondary"
      alt={formatMessage(messages['show.password'])}
    />
  );

  const placement = window.innerWidth < 768 ? 'top' : 'left';
  const tooltip = (
    <Tooltip id={`password-requirement-${placement}`}>
      <span id="letter-check" className="d-flex align-items-center">
        {LETTER_REGEX.test(props.value) ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1 text-light-700" src={Remove} />}
        {formatMessage(messages['one.letter'])}
      </span>
      <span id="number-check" className="d-flex align-items-center">
        {NUMBER_REGEX.test(props.value) ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1 text-light-700" src={Remove} />}
        {formatMessage(messages['one.number'])}
      </span>
      <span id="characters-check" className="d-flex align-items-center">
        {props.value.length >= 8 ? <Icon className="text-success mr-1" src={Check} /> : <Icon className="mr-1 text-light-700" src={Remove} />}
        {formatMessage(messages['eight.characters'])}
      </span>
    </Tooltip>
  );

  return (
    <Form.Group controlId={props.name} isInvalid={props.errorMessage !== ''}>
      <OverlayTrigger key="tooltip" placement={placement} overlay={tooltip} show={showTooltip}>
        <Form.Control
          as="input"
          className="form-group__form-field"
          type={isPasswordHidden ? 'password' : 'text'}
          name={props.name}
          value={props.value}
          autoComplete={props.autoComplete}
          aria-invalid={props.errorMessage !== ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={props.handleChange}
          controlClassName={props.borderClass}
          trailingElement={isPasswordHidden ? ShowButton : HideButton}
          floatingLabel={props.floatingLabel}
        />
      </OverlayTrigger>
      {props.errorMessage !== '' && (
        <Form.Control.Feedback key="error" className="form-text-size" hasIcon={false} feedback-for={props.name} type="invalid">
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
  handleErrorChange: null,
  showRequirements: true,
  autoComplete: null,
};

PasswordField.propTypes = {
  borderClass: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  handleChange: PropTypes.func,
  handleErrorChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  showRequirements: PropTypes.bool,
  value: PropTypes.string.isRequired,
  autoComplete: PropTypes.string,
};

export default PasswordField;
