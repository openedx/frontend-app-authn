import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { EDUCATION_LEVELS, GENDER_OPTIONS, YEAR_OF_BIRTH_OPTIONS } from './data/constants';
import messages from './messages';

import { AuthnValidationFormGroup } from '../common-components';

const OptionalFields = (props) => {
  const { intl, onChangeHandler, values } = props;

  const getOptions = () => ({
    yearOfBirthOptions: [{
      value: '',
      label: intl.formatMessage(messages['registration.year.of.birth.label']),
    }].concat(YEAR_OF_BIRTH_OPTIONS),
    educationLevelOptions: EDUCATION_LEVELS.map(key => ({
      value: key,
      label: intl.formatMessage(messages[`registration.field.education.levels.${key || 'label'}`]),
    })),
    genderOptions: GENDER_OPTIONS.map(key => ({
      value: key,
      label: intl.formatMessage(messages[`registration.field.gender.options.${key || 'label'}`]),
    })),
  });

  return (
    <>
      <AuthnValidationFormGroup
        label={intl.formatMessage(messages['registration.field.gender.options.label'])}
        for="gender"
        name="gender"
        type="select"
        key="gender"
        value={values.gender}
        className="mb-20 opt-inline-field data-hj-suppress"
        onChange={(e) => onChangeHandler('gender', e.target.value)}
        selectOptions={getOptions().genderOptions}
      />
      <AuthnValidationFormGroup
        label={intl.formatMessage(messages['registration.year.of.birth.label'])}
        for="yearOfBirth"
        name="yearOfBirth"
        type="select"
        key="yearOfBirth"
        value={values.yearOfBirth}
        className="mb-20 opt-inline-field opt-year-field data-hj-suppress"
        onChange={(e) => onChangeHandler('yearOfBirth', e.target.value)}
        selectOptions={getOptions().yearOfBirthOptions}
      />
      <AuthnValidationFormGroup
        label={intl.formatMessage(messages['registration.field.education.levels.label'])}
        for="levelOfEducation"
        name="levelOfEducation"
        type="select"
        key="levelOfEducation"
        value={values.levelOfEducation}
        className="mb-20 data-hj-suppress"
        onChange={(e) => onChangeHandler('levelOfEducation', e.target.value)}
        selectOptions={getOptions().educationLevelOptions}
      />
      <AuthnValidationFormGroup
        label={intl.formatMessage(messages['registration.goals.label'])}
        for="goals"
        name="goals"
        type="textarea"
        key="goals"
        value={values.goals}
        className="mb-20"
        onChange={(e) => onChangeHandler('goals', e.target.value)}
        inputFieldStyle="border-gray-600"
      />
    </>
  );
};

OptionalFields.propTypes = {
  intl: intlShape.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  values: PropTypes.shape({
    gender: PropTypes.string,
    goals: PropTypes.string,
    levelOfEducation: PropTypes.string,
    yearOfBirth: PropTypes.string,
  }).isRequired,
};

export default injectIntl(OptionalFields);
