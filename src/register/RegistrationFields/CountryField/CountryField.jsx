import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { FormAutosuggest, FormAutosuggestOption, FormControlFeedback } from '@edx/paragon';
import PropTypes from 'prop-types';

import validateCountryField, { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './validator';
import { clearRegistrationBackendError } from '../../data/actions';
import messages from '../../messages';

/**
 * Country field wrapper. It accepts following handlers
 * - handleChange for setting value change and
 * - handleErrorChange for setting error
 *
 * It is responsible for
 * - Auto populating country field if backendCountryCode is available in redux
 * - Performing country field validations
 * - clearing error on focus
 * - setting value on change and selection
 */
const CountryField = (props) => {
  const {
    countryList,
    selectedCountry,
    onChangeHandler,
    handleErrorChange,
    onFocusHandler,
  } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const backendCountryCode = useSelector(state => state.register.backendCountryCode);

  useEffect(() => {
    if (backendCountryCode && backendCountryCode !== selectedCountry?.countryCode) {
      let countryCode = '';
      let countryDisplayValue = '';

      const countryVal = countryList.find(
        (country) => (country[COUNTRY_CODE_KEY].toLowerCase() === backendCountryCode.toLowerCase()),
      );
      if (countryVal) {
        countryCode = countryVal[COUNTRY_CODE_KEY];
        countryDisplayValue = countryVal[COUNTRY_DISPLAY_KEY];
      }
      onChangeHandler(
        { target: { name: 'country' } },
        { countryCode, displayValue: countryDisplayValue },
      );
    }
  }, [backendCountryCode, countryList]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnBlur = (event) => {
    // Do not run validations when drop-down arrow is clicked
    if (event.relatedTarget && event.relatedTarget.className.includes('pgn__form-autosuggest__icon-button')) {
      return;
    }

    const { value } = event.target;

    const { countryCode, displayValue, error } = validateCountryField(
      value.trim(), countryList, formatMessage(messages['empty.country.field.error']),
    );

    onChangeHandler({ target: { name: 'country' } }, { countryCode, displayValue });
    handleErrorChange('country', error);
  };

  const handleSelected = (value) => {
    handleOnBlur({ target: { name: 'country', value } });
  };

  const handleOnFocus = (event) => {
    handleErrorChange('country', '');
    dispatch(clearRegistrationBackendError('country'));
    onFocusHandler(event);
  };

  const handleOnChange = (value) => {
    onChangeHandler({ target: { name: 'country' } }, { countryCode: '', displayValue: value });
  };

  const getCountryList = () => countryList.map((country) => (
    <FormAutosuggestOption key={country[COUNTRY_CODE_KEY]}>
      {country[COUNTRY_DISPLAY_KEY]}
    </FormAutosuggestOption>
  ));

  return (
    <div className="mb-4">
      <FormAutosuggest
        floatingLabel={formatMessage(messages['registration.country.label'])}
        aria-label="form autosuggest"
        name="country"
        value={selectedCountry.displayValue || ''}
        onSelected={(value) => handleSelected(value)}
        onFocus={(e) => handleOnFocus(e)}
        onBlur={(e) => handleOnBlur(e)}
        onChange={(value) => handleOnChange(value)}
      >
        {getCountryList()}
      </FormAutosuggest>
      {props.errorMessage !== '' && (
        <FormControlFeedback
          key="error"
          className="form-text-size"
          hasIcon={false}
          feedback-for="country"
          type="invalid"
        >
          {props.errorMessage}
        </FormControlFeedback>
      )}
    </div>
  );
};

CountryField.propTypes = {
  countryList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
  onFocusHandler: PropTypes.func.isRequired,
  selectedCountry: PropTypes.shape({
    displayValue: PropTypes.string,
    countryCode: PropTypes.string,
  }),
};

CountryField.defaultProps = {
  errorMessage: null,
  selectedCountry: {
    value: '',
  },
};

export default CountryField;
