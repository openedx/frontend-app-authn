import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Icon } from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';

import { EDUCATION_LEVELS, GENDER_OPTIONS, YEAR_OF_BIRTH_OPTIONS } from './data/constants';
import messages from './messages';

const OptionalFields = (props) => {
  const {
    intl, optionalFields, onChangeHandler, values,
  } = props;

  const getOptions = () => ({
    yearOfBirthOptions: YEAR_OF_BIRTH_OPTIONS.map(({ value, label }) => (
      <option className="data-hj-suppress" key={value} value={value}>{label}</option>
    )),
    educationLevelOptions: EDUCATION_LEVELS.map(key => (
      <option className="data-hj-suppress" key={key} value={key}>
        {intl.formatMessage(messages[`registration.field.education.levels.${key || 'label'}`])}
      </option>
    )),
    genderOptions: GENDER_OPTIONS.map(key => (
      <option className="data-hj-suppress" key={key} value={key}>
        {intl.formatMessage(messages[`registration.field.gender.options.${key || 'label'}`])}
      </option>
    )),
  });

  return (
    <div className="mt-3">
      {optionalFields.includes('gender') && (
        <Form.Group controlId="gender">
          <Form.Control
            as="select"
            name="gender"
            value={values.gender}
            onChange={(e) => onChangeHandler('gender', e.target.value)}
            trailingElement={<Icon src={ExpandMore} />}
            floatingLabel={intl.formatMessage(messages['registration.field.gender.options.label'])}
          >
            {getOptions().genderOptions}
          </Form.Control>
        </Form.Group>
      )}
      {optionalFields.includes('yearOfBirth') && (
        <Form.Group controlId="yearOfBirth">
          <Form.Control
            as="select"
            name="yearOfBirth"
            value={values.yearOfBirth}
            onChange={(e) => onChangeHandler('yearOfBirth', e.target.value)}
            trailingElement={<Icon src={ExpandMore} />}
            floatingLabel={intl.formatMessage(messages['registration.year.of.birth.label'])}
          >
            <option value="">{intl.formatMessage(messages['registration.year.of.birth.label'])}</option>
            {getOptions().yearOfBirthOptions}
          </Form.Control>
        </Form.Group>
      )}
      {optionalFields.includes('levelOfEducation') && (
        <Form.Group controlId="levelOfEducation">
          <Form.Control
            as="select"
            name="levelOfEducation"
            value={values.levelOfEducation}
            onChange={(e) => onChangeHandler('levelOfEducation', e.target.value)}
            trailingElement={<Icon src={ExpandMore} />}
            floatingLabel={intl.formatMessage(messages['registration.field.education.levels.label'])}
          >
            {getOptions().educationLevelOptions}
          </Form.Control>
        </Form.Group>
      )}
      {optionalFields.includes('goals') && (
        <Form.Group controlId="goals">
          <Form.Control
            as="textarea"
            name="goals"
            value={values.goals}
            onChange={(e) => onChangeHandler('goals', e.target.value)}
            floatingLabel={intl.formatMessage(messages['registration.goals.label'])}
          />
        </Form.Group>
      )}
    </div>
  );
};

OptionalFields.propTypes = {
  intl: intlShape.isRequired,
  optionalFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  values: PropTypes.shape({
    gender: PropTypes.string,
    goals: PropTypes.string,
    levelOfEducation: PropTypes.string,
    yearOfBirth: PropTypes.string,
  }).isRequired,
};

export default injectIntl(OptionalFields);
