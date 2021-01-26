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
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Formik } from 'formik';
import messages from './messages';
import { forgotPassword } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import RequestInProgressAlert from './RequestInProgressAlert';
import { LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import LoginHelpLinks from '../login/LoginHelpLinks';

const ForgotPasswordPage = (props) => {
  const { intl, status } = props;
  let invalidEmailMessage;

  const validateEmail = (e, setFieldValue) => {
    invalidEmailMessage = intl.formatMessage(messages['forgot.password.page.invalid.email.message']);
    const regex = new RegExp(VALID_EMAIL_REGEX, 'i');

    const inputEmail = e.target.value;
    const isEmailValid = regex.test(inputEmail);
    setFieldValue('email', inputEmail);
    setFieldValue('isEmailValid', isEmailValid);
    if (inputEmail.length < 3) {
      invalidEmailMessage = `${intl.formatMessage(messages['forgot.password.page.email.invalid.length.message'])} ${invalidEmailMessage}`;
    }
  };

  sendPageEvent('login_and_registration', 'reset');

  return (
    <Formik
      onSubmit={(values) => {
        if (values.isEmailValid) {
          props.forgotPassword(values.email);
        }
      }}
      initialValues={{
        email: '',
        isEmailValid: true,
      }}
    >
      {({
        handleSubmit,
        values,
        setFieldValue,
      }) => (
        <>
          {status === 'complete' ? <Redirect to={LOGIN_PAGE} /> : null}
          <div className="d-flex justify-content-center m-4">
            <div className="d-flex flex-column">
              <Form className="mw-500">
                {status === 'forbidden' ? <RequestInProgressAlert /> : null}
                <h3 className="mt-3">
                  {intl.formatMessage(messages['forgot.password.page.heading'])}
                </h3>
                <p className="mb-4">
                  {intl.formatMessage(messages['forgot.password.page.instructions'])}
                </p>
                <ValidationFormGroup
                  className="mb-0 w-100"
                  for="email"
                  invalid={!values.isEmailValid}
                  invalidMessage={invalidEmailMessage}
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
                    onChange={e => validateEmail(e, setFieldValue)}
                  />
                  <p className="mb-2">
                    {intl.formatMessage(messages['forgot.password.page.email.field.help.text'])}
                  </p>
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
