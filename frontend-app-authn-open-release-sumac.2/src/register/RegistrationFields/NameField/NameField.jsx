import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import validateName from './validator';
import { FormGroup } from '../../../common-components';
import { clearRegistrationBackendError, fetchRealtimeValidations } from '../../data/actions';

/**
 * Name field wrapper. It accepts following handlers
 * - handleChange for setting value change and
 * - handleErrorChange for setting error
 *
 * It is responsible for
 * - Making backend call for generating username suggestions
 * - Performing name field validations
 * - Clearing error on focus
 * - Setting value on change
 */
const NameField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const validationApiRateLimited = useSelector(state => state.register.validationApiRateLimited);

  const {
    handleErrorChange,
    shouldFetchUsernameSuggestions,
  } = props;

  const handleOnBlur = (e) => {
    const { value } = e.target;
    const fieldError = validateName(value, formatMessage);
    if (fieldError) {
      handleErrorChange('name', fieldError);
    } else if (shouldFetchUsernameSuggestions && !validationApiRateLimited) {
      dispatch(fetchRealtimeValidations({ name: value }));
    }
  };

  const handleOnFocus = () => {
    handleErrorChange('name', '');
    dispatch(clearRegistrationBackendError('name'));
  };

  return (
    <FormGroup
      {...props}
      handleBlur={handleOnBlur}
      handleFocus={handleOnFocus}
    />
  );
};

NameField.defaultProps = {
  errorMessage: '',
  shouldFetchUsernameSuggestions: false,
};

NameField.propTypes = {
  errorMessage: PropTypes.string,
  shouldFetchUsernameSuggestions: PropTypes.bool,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
};

export default NameField;
