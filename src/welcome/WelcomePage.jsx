import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import {
  ensureAuthenticatedUser, hydrateAuthenticatedUser, getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form,
  StatefulButton,
  Hyperlink,
  Icon,
} from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';

import messages from './messages';

import { EDUCATION_LEVELS, GENDER_OPTIONS, YEAR_OF_BIRTH_OPTIONS } from '../register/data/constants';
import { FormGroup } from '../common-components';
import { DEFAULT_REDIRECT_URL } from '../data/constants';

const WelcomePage = (props) => {
  const { intl } = props;
  const [registrationResult, setRegistrationResult] = useState({});
  const [values, setValues] = useState({ levelOfEducation: '', yearOfBirth: '', gender: '' });
  const [ready, setReady] = useState(false);
  const DASHBOARD_URL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  useEffect(() => {
    ensureAuthenticatedUser(DASHBOARD_URL).then(() => {
      hydrateAuthenticatedUser().then(() => {
        setReady(true);
      });
    });

    if (props.location.state && props.location.state.registrationResult) {
      setRegistrationResult(props.location.state.registrationResult);
    }
  }, []);

  const authenticatedUser = getAuthenticatedUser();

  if (!props.location.state || !props.location.state.registrationResult) {
    global.location.assign(DASHBOARD_URL);
    return null;
  }

  if (!ready) {
    return null;
  }

  const getOptions = (fieldName) => {
    const options = {
      yearOfBirth: [{
        value: '',
        label: intl.formatMessage(messages['registration.year.of.birth.label']),
      }].concat(YEAR_OF_BIRTH_OPTIONS),
      levelOfEducation: EDUCATION_LEVELS.map(key => ({
        value: key,
        label: intl.formatMessage(messages[`registration.field.education.levels.${key || 'label'}`]),
      })),
      gender: GENDER_OPTIONS.map(key => ({
        value: key,
        label: intl.formatMessage(messages[`registration.field.gender.options.${key || 'label'}`]),
      })),
    };

    return [
      options[fieldName].map(({ value, label }) => (
        <option className="data-hj-suppress" key={value} value={value}>{label}</option>)),
    ];
  };

  const fireOptimizelyEvent = () => {
    window.optimizely = window.optimizely || [];
    window.optimizely.push({
      type: 'event',
      eventName: 'van_504_conversion_rate',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fireOptimizelyEvent();
    window.optimizely = window.optimizely || [];
    ['yearOfBirth', 'gender', 'levelOfEducation'].forEach(fieldName => {
      if (values[fieldName]) {
        window.optimizely.push({
          type: 'event',
          eventName: `van_504_${fieldName}`,
        });
      }
    });
    if (registrationResult.success) {
      window.location.href = registrationResult.redirectUrl;
    }
    return null;
  };

  const handleSkip = (e) => {
    e.preventDefault();
    fireOptimizelyEvent();
    window.location.href = registrationResult.redirectUrl;
    return null;
  };

  const onChangeHandler = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage(messages['optional.fields.page.title'],
          { siteName: getConfig().SITE_NAME })}
        </title>
      </Helmet>
      <div className="d-flex justify-content-center m-4">
        <div className="d-flex flex-column">
          <Form className="mw-500">
            <p className="mb-4" data-hj-suppress>
              { intl.formatMessage(messages['welcome.to.edx'], { username: authenticatedUser.username }) }
            </p>
            <hr className="mb-3 border-gray-200" />
            <h1 className="mb-3 h3">{intl.formatMessage(messages['optional.fields.page.heading'])}</h1>
            <FormGroup
              floatingLabel={intl.formatMessage(messages['registration.field.education.levels.label'])}
              for="levelOfEducation"
              name="levelOfEducation"
              as="select"
              key="levelOfEducation"
              className="mb-3 data-hj-suppress"
              value={values.levelOfEducation}
              handleChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              options={() => getOptions('levelOfEducation')}
            />
            <FormGroup
              floatingLabel={intl.formatMessage(messages['registration.year.of.birth.label'])}
              for="yearOfBirth"
              name="yearOfBirth"
              as="select"
              key="yearOfBirth"
              value={values.yearOfBirth}
              className="mb-3 data-hj-suppress"
              handleChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              options={() => getOptions('yearOfBirth')}
            />
            <FormGroup
              floatingLabel={intl.formatMessage(messages['registration.field.gender.options.label'])}
              for="gender"
              name="gender"
              as="select"
              key="gender"
              value={values.gender}
              className="mb-3 data-hj-suppress"
              handleChange={(e) => onChangeHandler(e)}
              trailingElement={<Icon src={ExpandMore} />}
              options={() => getOptions('gender')}
            />
            <p>
              <Hyperlink
                className="mt-1 text-dark small"
                destination={getConfig().WELCOME_PAGE_SUPPORT_LINK}
                target="_blank"
              >
                {intl.formatMessage(messages['optional.fields.information.link'])}
              </Hyperlink>
            </p>
            <div className="d-flex mt-3">
              <StatefulButton
                type="submit"
                variant="brand"
                labels={{
                  default: intl.formatMessage(messages['optional.fields.submit.button']),
                }}
                onClick={handleSubmit}
                onMouseDown={(e) => e.preventDefault()}
              />
              <StatefulButton
                type="submit"
                variant="link"
                className="ml-1 text-dark"
                labels={{
                  default: intl.formatMessage(messages['optional.fields.skip.button']),
                }}
                onClick={handleSkip}
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

WelcomePage.propTypes = {
  intl: intlShape.isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }),
};

WelcomePage.defaultProps = {
  location: { state: {} },
};

export default (injectIntl(WelcomePage));
