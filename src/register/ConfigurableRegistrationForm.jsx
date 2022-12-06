import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import FormFieldRenderer from '../field-renderer';
import { FIELDS } from './data/constants';
import { validateCountryField } from './data/utils';
import messages from './messages';
import { HonorCode, TermsOfService } from './registrationFields';
import CountryField from './registrationFields/CountryField';

/**
 * Fields on registration page that are not the default required fields (name, email, username, password).
 * These configurable required fields are defined on the backend using REGISTRATION_EXTRA_FIELDS setting.
 *
 * Country and Honor Code/Terms of Services (if enabled) will appear at the bottom of the form, even if they
 * appear higher in order returned by backend. This is to make the user experience better.
 *
 * For edX only:
 *  Country and honor code fields are required by default, and we will continue to show them on
 *  frontend even if the API doesn't return it. The `SHOW_CONFIGURABLE_EDX_FIELDS` flag will enable
 *  it for edX.
 * */
const ConfigurableRegistrationForm = (props) => {
  const {
    countryList,
    email,
    fieldDescriptions,
    fieldErrors,
    formFields,
    intl,
    setFieldErrors,
    setFocusedField,
    setFormFields,
  } = props;

  let showTermsOfServiceAndHonorCode = false;
  let showCountryField = false;

  const formFieldDescriptions = [];
  const honorCode = [];
  const flags = {
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };

  useEffect(() => {
    if (!formFields.country) {
      setFormFields({ ...formFields, country: { countryCode: '', displayValue: '' } });
    }
  });

  const handleOnChange = (event, countryValue = null) => {
    const { name, type } = event.target;
    let value;
    if (countryValue) {
      value = { ...countryValue };
    } else {
      value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      if (type === 'checkbox') {
        setFieldErrors({ ...fieldErrors, [name]: '' });
      }
    }
    setFormFields({ ...formFields, [name]: value });
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    let error = '';
    if (name === 'country') {
      const countryValidation = validateCountryField(
        value.trim(), countryList, intl.formatMessage(messages['empty.country.field.error']),
      );
      const { countryCode, displayValue } = countryValidation;
      error = countryValidation.error;
      setFormFields({ ...formFields, country: { countryCode, displayValue } });
    } else if (!value || !value.trim()) {
      error = fieldDescriptions[name].error_message;
    } else if (name === 'confirm_email' && value !== email) {
      error = intl.formatMessage(messages['email.do.not.match']);
    }
    setFocusedField(null);
    setFieldErrors({ ...fieldErrors, [name]: error });
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setFieldErrors({ ...fieldErrors, [name]: '' });
    // Since we are removing the form errors from the focused field, we will
    // need to rerun the validation for focused field on form submission.
    setFocusedField(name);
  };

  if (flags.showConfigurableRegistrationFields) {
    Object.keys(fieldDescriptions).forEach(fieldName => {
      const fieldData = fieldDescriptions[fieldName];
      switch (fieldData.name) {
        case FIELDS.COUNTRY:
          showCountryField = true;
          break;
        case FIELDS.HONOR_CODE:
          if (fieldData.type === 'tos_and_honor_code') {
            showTermsOfServiceAndHonorCode = true;
          } else {
            honorCode.push(
              <span key={fieldData.name}>
                <HonorCode
                  fieldType={fieldData.type}
                  value={formFields[fieldData.name]}
                  onChangeHandler={handleOnChange}
                  errorMessage={fieldErrors[fieldData.name]}
                />
              </span>,
            );
          }
          break;
        case FIELDS.TERMS_OF_SERVICE:
          honorCode.push(
            <span key={fieldData.name}>
              <TermsOfService
                value={formFields[fieldData.name]}
                onChangeHandler={handleOnChange}
                errorMessage={fieldErrors[fieldData.name]}
              />
            </span>,
          );
          break;
        default:
          formFieldDescriptions.push(
            <span key={fieldData.name}>
              <FormFieldRenderer
                fieldData={fieldData}
                value={formFields[fieldData.name]}
                onChangeHandler={handleOnChange}
                handleBlur={handleOnBlur}
                handleFocus={handleOnFocus}
                errorMessage={fieldErrors[fieldData.name]}
                isRequired
              />
            </span>,
          );
      }
    });
  }

  if (flags.showConfigurableEdxFields || showCountryField) {
    formFieldDescriptions.push(
      <span key="country">
        <CountryField
          countryList={countryList}
          selectedCountry={formFields.country}
          errorMessage={fieldErrors.country || ''}
          onChangeHandler={handleOnChange}
          onBlurHandler={handleOnBlur}
          onFocusHandler={handleOnFocus}
        />
      </span>,
    );
  }

  if (flags.showMarketingEmailOptInCheckbox) {
    formFieldDescriptions.push(
      <span key="marketing_email_opt_in">
        <FormFieldRenderer
          fieldData={{
            type: 'checkbox',
            label: intl.formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME }),
            name: 'marketingEmailsOptIn',
          }}
          value={formFields.marketingEmailsOptIn}
          className="opt-checkbox"
          onChangeHandler={handleOnChange}
          handleBlur={handleOnBlur}
          handleFocus={handleOnFocus}
        />
      </span>,
    );
  }

  if (flags.showConfigurableEdxFields || showTermsOfServiceAndHonorCode) {
    formFieldDescriptions.push(
      <span key="honor_code">
        <HonorCode fieldType="tos_and_honor_code" onChangeHandler={handleOnChange} value={formFields.honor_code} />
      </span>,
    );
  }

  return (
    <>
      {formFieldDescriptions}
      <div>
        {honorCode}
      </div>
    </>
  );
};

ConfigurableRegistrationForm.propTypes = {
  countryList: PropTypes.arrayOf(PropTypes.object).isRequired,
  email: PropTypes.string.isRequired,
  fieldDescriptions: PropTypes.shape({}),
  fieldErrors: PropTypes.shape({
    country: PropTypes.string,
  }).isRequired,
  formFields: PropTypes.shape({
    country: PropTypes.shape({
      displayValue: PropTypes.string,
      countryCode: PropTypes.string,
    }),
    honor_code: PropTypes.bool,
    marketingEmailsOptIn: PropTypes.bool,
  }).isRequired,
  intl: intlShape.isRequired,
  setFieldErrors: PropTypes.func.isRequired,
  setFocusedField: PropTypes.func.isRequired,
  setFormFields: PropTypes.func.isRequired,
};

ConfigurableRegistrationForm.defaultProps = {
  fieldDescriptions: {},
};

export default injectIntl(ConfigurableRegistrationForm);
