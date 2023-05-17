import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { FormAutosuggest, FormAutosuggestOption, FormControlFeedback } from '@edx/paragon';
import PropTypes from 'prop-types';

import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from '../data/constants';
import messages from '../messages';

const CountryField = (props) => {
  const { countryList, selectedCountry } = props;
  const { formatMessage } = useIntl();

  const handleSelected = (value) => {
    if (props.onBlurHandler) { props.onBlurHandler({ target: { name: 'country', value } }); }
  };

  const onFocusHandler = (event) => {
    if (props.onFocusHandler) { props.onFocusHandler(event); }
  };

  const onChangeHandler = (value) => {
    if (props.onChangeHandler) {
      props.onChangeHandler({ target: { name: 'country' } }, { countryCode: '', displayValue: value });
    }
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
        onFocus={(e) => onFocusHandler(e)}
        onBlur={(e) => handleSelected(e.target.value)}
        onChange={(value) => onChangeHandler(value)}
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
  onBlurHandler: PropTypes.func.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
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
