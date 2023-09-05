import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './constants';

const validateCountryField = (value, countryList, errorMessage) => {
  let countryCode = '';
  let displayValue = value;
  let error = errorMessage;

  if (value) {
    const normalizedValue = value.toLowerCase();
    // Handling a case here where user enters a valid country code that needs to be
    // evaluated and set its value as a valid value.
    const selectedCountry = countryList.find(
      (country) => (
        // When translations are applied, extra space added in country value, so we should trim that.
        country[COUNTRY_DISPLAY_KEY].toLowerCase().trim() === normalizedValue
        || country[COUNTRY_CODE_KEY].toLowerCase().trim() === normalizedValue
      ),
    );
    if (selectedCountry) {
      countryCode = selectedCountry[COUNTRY_CODE_KEY];
      displayValue = selectedCountry[COUNTRY_DISPLAY_KEY];
      error = '';
    }
  }
  return { error, countryCode, displayValue };
};

export default validateCountryField;
