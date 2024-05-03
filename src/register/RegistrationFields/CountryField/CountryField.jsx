import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { FormAutosuggest, FormAutosuggestOption, FormControlFeedback } from '@openedx/paragon';
import classNames from 'classnames';
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

  const countryFieldValue = {
    userProvidedText: selectedCountry.displayValue,
    selectionValue: selectedCountry.displayValue,
    selectionId: selectedCountry.countryCode,
  };

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
    } else if (!selectedCountry.displayValue) {
      onChangeHandler(
        { target: { name: 'country' } },
        { countryCode: '', displayValue: '' },
      );
    }
  }, [backendCountryCode, countryList]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnBlur = (event) => {
    // Do not run validations when drop-down arrow is clicked
    if (event.relatedTarget && event.relatedTarget.className.includes('pgn__form-autosuggest__icon-button')) {
      return;
    }

    const { value } = event.target;

    const { error } = validateCountryField(
      value.trim(), countryList, formatMessage(messages['empty.country.field.error']), formatMessage(messages['invalid.country.field.error']),
    );
    handleErrorChange('country', error);
  };

  const handleOnFocus = (event) => {
    handleErrorChange('country', '');
    dispatch(clearRegistrationBackendError('country'));
    onFocusHandler(event);
  };

  const handleOnChange = (value) => {
    onChangeHandler({ target: { name: 'country' } }, { countryCode: value.selectionId, displayValue: value.userProvidedText });

    // We have put this check because proviously we also had onSelected event handler and we call
    // the onBlur on that event handler but now there is no such handler and we only have
    // onChange so we check the is there is proper sectionId which only be
    // proper one when we select it from dropdown's item otherwise its null.
    if (value.selectionId !== '') {
      handleOnBlur({ target: { name: 'country', value: value.userProvidedText } });
    }
  };

  const getCountryList = () => countryList.map((country) => (
    <FormAutosuggestOption key={country[COUNTRY_DISPLAY_KEY]} id={country[COUNTRY_CODE_KEY]}>
      {country[COUNTRY_DISPLAY_KEY]}
    </FormAutosuggestOption>
  ));

  return (
    <div className="mb-4">
      <FormAutosuggest
        floatingLabel={formatMessage(messages['registration.country.label'])}
        aria-label="form autosuggest"
        name="country"
        value={countryFieldValue || {}}
        className={classNames({ 'form-field-error': props.errorMessage })}
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
