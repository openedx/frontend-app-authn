export const COUNTRY_CODE_KEY = 'code';
export const COUNTRY_DISPLAY_KEY = 'name';

const validateCountryField = (value, countryList, emptyErrorMessage, invalidCountryErrorMessage) => {
  let countryCode = '';
  let displayValue = value;
  let error = '';

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
    } else {
      error = invalidCountryErrorMessage;
    }
  } else {
    error = emptyErrorMessage;
  }
  return { error, countryCode, displayValue };
};

export default validateCountryField;
