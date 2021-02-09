import React, { useState } from 'react';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Form,
  StatefulButton,
} from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { forgotPassword } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import RequestInProgressAlert from './RequestInProgressAlert';

import messages from './messages';
import {
  AuthnValidationFormGroup,
} from '../common-components';
import APIFailureMessage from '../common-components/APIFailureMessage';
import { INTERNAL_SERVER_ERROR, LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import LoginHelpLinks from '../login/LoginHelpLinks';

const ForgotPasswordPage = (props) => {
  const { intl, status } = props;

  const platformName = getConfig().SITE_NAME;
  const regex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const [validationError, setValidationError] = useState('');

  const getErrorMessage = (errors) => {
    const header = intl.formatMessage(messages['forgot.password.request.server.error']);
    if (errors.email) {
      return (
        <Alert variant="danger">
          <Alert.Heading>{header}</Alert.Heading>
          <ul><li>{errors.email}</li></ul>
        </Alert>
      );
    }
    if (status === INTERNAL_SERVER_ERROR) {
      return <APIFailureMessage header={header} />;
    }
    return status === 'forbidden' ? <RequestInProgressAlert /> : null;
  };

  const getValidationMessage = (email) => {
    let error = '';

    if (email === '') {
      error = intl.formatMessage(messages['forgot.password.empty.email.field.error']);
    } else if (!regex.test(email)) {
      error = intl.formatMessage(messages['forgot.password.page.invalid.email.message']);
    }

    setValidationError(error);
    return error;
  };

  sendPageEvent('login_and_registration', 'reset');

  return (
    <Formik
      initialValues={{ email: '' }}
      validateOnChange={false}
      validate={(values) => {
        const validationMessage = getValidationMessage(values.email);

        if (validationMessage !== '') {
          window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
          return { email: validationMessage };
        }

        return {};
      }}
      onSubmit={(values) => { props.forgotPassword(values.email); }}
    >
      {({
        errors, handleSubmit, setFieldValue, values,
      }) => (
        <>
          {status === 'complete' ? <Redirect to={LOGIN_PAGE} /> : null}
          <div className="d-flex justify-content-center m-4">
            <div className="d-flex flex-column">
              <Form className="mw-500">
                { getErrorMessage(errors) }
                <h3 className="mt-3">
                  {intl.formatMessage(messages['forgot.password.page.heading'])}
                </h3>
                <p className="mb-4">
                  {intl.formatMessage(messages['forgot.password.page.instructions'])}
                </p>
                <AuthnValidationFormGroup
                  label={intl.formatMessage(messages['forgot.password.page.email.field.label'])}
                  for="forgot-password-input"
                  name="email"
                  type="email"
                  invalid={validationError !== ''}
                  invalidMessage={validationError}
                  placeholder="username@domain.com"
                  value={values.email}
                  onBlur={() => getValidationMessage(values.email)}
                  onChange={e => setFieldValue('email', e.target.value)}
                  helpText={intl.formatMessage(messages['forgot.password.email.help.text'], { platformName })}
                  className="mb-0 w-100"
                />
                <LoginHelpLinks page="forgot-password" />
                <StatefulButton
                  type="submit"
                  className="btn-primary mt-3"
                  state={status}
                  labels={{
                    default: intl.formatMessage(messages['forgot.password.page.submit.button']),
                  }}
                  icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
                  onClick={handleSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                />
              </Form>
            </div>
          </div>
        </>
      )}
    </Formik>
  );
};

ForgotPasswordPage.propTypes = {
  intl: intlShape.isRequired,
  forgotPassword: PropTypes.func.isRequired,
  status: PropTypes.string,
};

ForgotPasswordPage.defaultProps = {
  status: null,
};

export default connect(
  forgotPasswordResultSelector,
  {
    forgotPassword,
  },
)(injectIntl(ForgotPasswordPage));
