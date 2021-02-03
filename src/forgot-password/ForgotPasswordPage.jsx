import React from 'react';
import PropTypes from 'prop-types';
import { sendPageEvent } from '@edx/frontend-platform/analytics';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  Form,
  Input,
  StatefulButton,
  ValidationFormGroup,
  Alert,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { Formik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import messages from './messages';
import { forgotPassword } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import RequestInProgressAlert from './RequestInProgressAlert';
import { LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import LoginHelpLinks from '../login/LoginHelpLinks';
import APIFailureMessage from '../common-components/APIFailureMessage';
import { INTERNAL_SERVER_ERROR } from '../login/data/constants';

const ForgotPasswordPage = (props) => {
  const { intl, status } = props;

  const platformName = getConfig().SITE_NAME;
  const handleOnChange = (e, setFieldValue) => {
    setFieldValue('email', e.target.value);
  };

  const getStatusBannerifAny = (errors) => {
    if (errors.email) {
      return (
        <Alert variant="danger">
          <Alert.Heading>
            {intl.formatMessage(messages['forgot.password.invalid.email.heading'])}
          </Alert.Heading>
          {intl.formatMessage(messages['forgot.password.invalid.email.message'])}
        </Alert>
      );
    }
    if (status === INTERNAL_SERVER_ERROR) {
      return <APIFailureMessage header={intl.formatMessage(messages['forgot.password.request.server.error'])} />;
    }
    return status === 'forbidden' ? <RequestInProgressAlert /> : null;
  };
  sendPageEvent('login_and_registration', 'reset');

  return (
    <Formik
      onSubmit={(values) => props.forgotPassword(values.email)}
      validate={(values) => {
        const regex = new RegExp(VALID_EMAIL_REGEX, 'i');
        if (!regex.test(values.email)) {
          return { email: intl.formatMessage(messages['forgot.password.page.invalid.email.message']) };
        }
        return {};
      }}
      initialValues={{
        email: '',
        isEmailValid: true,
      }}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({
        handleSubmit,
        values,
        setFieldValue,
        errors,
      }) => (
        <>
          {status === 'complete' ? <Redirect to={LOGIN_PAGE} /> : null}
          <div className="d-flex justify-content-center m-4">
            <div className="d-flex flex-column">
              <Form className="mw-500">
                { getStatusBannerifAny(errors)}
                <h3 className="mt-3">
                  {intl.formatMessage(messages['forgot.password.page.heading'])}
                </h3>
                <p className="mb-4">
                  {intl.formatMessage(messages['forgot.password.page.instructions'])}
                </p>
                <ValidationFormGroup
                  className="mb-0 w-100"
                  for="email"
                  invalid={errors.email !== undefined}
                  invalidMessage={errors.email}
                  helpText={intl.formatMessage(messages['forgot.password.email.help.text'], { platformName })}
                >
                  <Form.Label htmlFor="forgot-password-input" className="h6 mr-1">
                    {intl.formatMessage(messages['forgot.password.page.email.field.label'])}
                  </Form.Label>
                  <Input
                    name="email"
                    id="forgot-password-input"
                    type="email"
                    placeholder="username@domain.com"
                    value={values.email}
                    onChange={e => handleOnChange(e, setFieldValue)}
                  />
                </ValidationFormGroup>
                <LoginHelpLinks page="forgot-password" />
                <StatefulButton
                  type="button"
                  className="btn-primary mt-3"
                  state={status}
                  labels={{
                    default: intl.formatMessage(messages['forgot.password.page.submit.button']),
                  }}
                  onClick={handleSubmit}
                  icons={{ pending: <FontAwesomeIcon icon={faSpinner} spin /> }}
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
