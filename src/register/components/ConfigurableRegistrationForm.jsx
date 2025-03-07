import React, { useEffect, useMemo } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { getCountryList, getLocale, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { FormFieldRenderer } from '../../field-renderer';
import { FIELDS } from '../data/constants';
import messages from '../messages';
import { CountryField, HonorCode, TermsOfService } from '../RegistrationFields';

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
  const { formatMessage } = useIntl();
  const {
    email,
    fieldDescriptions,
    fieldErrors,
    formFields,
    setFieldErrors,
    setFormFields,
    autoSubmitRegistrationForm,
  } = props;

  /** The reason for adding the entry 'United States' is that Chrome browser aut-fill the form with the 'Unites
  States' instead of 'United States of America' which does not exist in country dropdown list and gets the user
  confused and unable to create an account. So we added the United States entry in the dropdown list.
 */
  const countryList = useMemo(() => getCountryList(getLocale()).concat([{ code: 'US', name: 'United States' }]), []);

  let showTermsOfServiceAndHonorCode = false;
  let showCountryField = false;

  const formFieldDescriptions = [];
  const honorCode = [];
  const flags = {
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };

  /**
   * If auto submitting register form, we will check tos and honor code fields if they exist for feature parity.
   */
  useEffect(() => {
    if (autoSubmitRegistrationForm) {
      if (Object.keys(fieldDescriptions).includes(FIELDS.HONOR_CODE)) {
        setFormFields(prevState => ({
          ...prevState,
          [FIELDS.HONOR_CODE]: true,
        }));
      }
      if (Object.keys(fieldDescriptions).includes(FIELDS.TERMS_OF_SERVICE)) {
        setFormFields(prevState => ({
          ...prevState,
          [FIELDS.TERMS_OF_SERVICE]: true,
        }));
      }
    }
  }, [autoSubmitRegistrationForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleErrorChange = (fieldName, error) => {
    if (fieldName) {
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: error,
      }));
    }
  };

  const handleOnChange = (event, countryValue = null) => {
    const { name } = event.target;
    let value;
    if (countryValue) {
      value = { ...countryValue };
    } else {
      value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      if (event.target.type === 'checkbox') {
        setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
      }
    }
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    let error = '';
    if ((!value || !value.trim()) && fieldDescriptions[name]?.error_message) {
      error = fieldDescriptions[name].error_message;
    } else if (name === 'confirm_email' && value !== email) {
      error = formatMessage(messages['email.do.not.match']);
    }
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
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
          handleErrorChange={handleErrorChange}
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
            label: formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME }),
            name: 'marketingEmailsOptIn',
          }}
          value={formFields.marketingEmailsOptIn}
          className="form-field--checkbox"
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
  setFieldErrors: PropTypes.func.isRequired,
  setFormFields: PropTypes.func.isRequired,
  autoSubmitRegistrationForm: PropTypes.bool,
};

ConfigurableRegistrationForm.defaultProps = {
  fieldDescriptions: {},
  autoSubmitRegistrationForm: false,
};

export default ConfigurableRegistrationForm;
