import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { NAME_FIELD_LABEL } from './constants';
import validateName from './validator';
import { FormGroup } from '../../../common-components';
import { clearRegistertionBackendError, fetchRealtimeValidations } from '../../data/actions';

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
      handleErrorChange(NAME_FIELD_LABEL, fieldError);
    } else if (shouldFetchUsernameSuggestions && !validationApiRateLimited) {
      dispatch(fetchRealtimeValidations({ name: value }));
    }
  };

  const handleOnFocus = () => {
    handleErrorChange(NAME_FIELD_LABEL, '');
    dispatch(clearRegistertionBackendError(NAME_FIELD_LABEL));
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
