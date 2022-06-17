import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form,
  Hyperlink,
  Icon,
  StatefulButton,
  Tab,
  Tabs,
} from '@edx/paragon';
import { ChevronLeft } from '@edx/paragon/icons';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import BaseComponent from '../base-component';
import { FormGroup } from '../common-components';
import { DEFAULT_STATE, LOGIN_PAGE, VALID_EMAIL_REGEX } from '../data/constants';
import { updatePathWithQueryParams, windowScrollTo } from '../data/utils';
import { forgotPassword } from './data/actions';
import { forgotPasswordResultSelector } from './data/selectors';
import ForgotPasswordAlert from './ForgotPasswordAlert';
import messages from './messages';

const ForgotPasswordPage = (props) => {
  const { intl, status, submitState } = props;

  const platformName = getConfig().SITE_NAME;
  const regex = new RegExp(VALID_EMAIL_REGEX, 'i');
  const [validationError, setValidationError] = useState('');
  const [key, setKey] = useState('');
  const supportUrl = getConfig().LOGIN_ISSUE_SUPPORT_LINK;

  useEffect(() => {
    sendPageEvent('login_and_registration', 'reset');
    sendTrackEvent('edx.bi.password_reset_form.viewed', { category: 'user-engagement' });
  }, []);

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

  const tabTitle = (
    <div className="d-flex">
      <Icon src={ChevronLeft} className="arrow-back-icon" />
      <span className="ml-2">{intl.formatMessage(messages['sign.in.text'])}</span>
    </div>
  );

  return (
    <BaseComponent>
      <div>
        <Tabs activeKey="" id="controlled-tab-example" onSelect={(k) => setKey(k)}>
          <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
        </Tabs>
        { key && (
          <Redirect to={updatePathWithQueryParams(key)} />
        )}
        <div id="main-content" className="main-content">
          <Formik
            initialValues={{ email: '' }}
            validateOnChange={false}
            validate={(values) => {
              const validationMessage = getValidationMessage(values.email);

              if (validationMessage !== '') {
                windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
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
                <Helmet>
                  <title>{intl.formatMessage(messages['forgot.password.page.title'],
                    { siteName: getConfig().SITE_NAME })}
                  </title>
                </Helmet>
                <Form id="forget-password-form" name="forget-password-form" className="mw-xs">
                  <ForgotPasswordAlert email={props.email} emailError={errors.email} status={status} />
                  <h2 className="h4">
                    {intl.formatMessage(messages['forgot.password.page.heading'])}
                  </h2>
                  <p className="mb-4">
                    {intl.formatMessage(messages['forgot.password.page.instructions'])}
                  </p>
                  <FormGroup
                    floatingLabel={intl.formatMessage(messages['forgot.password.page.email.field.label'])}
                    name="email"
                    errorMessage={validationError}
                    value={values.email}
                    handleBlur={() => getValidationMessage(values.email)}
                    handleChange={e => setFieldValue('email', e.target.value)}
                    handleFocus={() => setValidationError('')}
                    helpText={[intl.formatMessage(messages['forgot.password.email.help.text'], { platformName })]}
                  />
                  <StatefulButton
                    id="submit-forget-password"
                    name="submit-forget-password"
                    type="submit"
                    variant="brand"
                    className="login-button-width"
                    state={submitState}
                    labels={{
                      default: intl.formatMessage(messages['forgot.password.page.submit.button']),
                      pending: '',
                    }}
                    onClick={handleSubmit}
                    onMouseDown={(e) => e.preventDefault()}
                  />
                  <Hyperlink
                    id="forgot-password"
                    name="forgot-password"
                    className="ml-4 font-weight-500 text-body"
                    destination={supportUrl}
                    onClick={e => {
                      e.preventDefault();
                      window.open(supportUrl, '_blank');
                    }}
                  >{intl.formatMessage(messages['need.help.sign.in.text'])}
                  </Hyperlink>
                  <p className="mt-5 one-rem-font">{intl.formatMessage(messages['additional.help.text'])}
                    <span><Hyperlink isInline destination={`mailto:${getConfig().INFO_EMAIL}`}>{getConfig().INFO_EMAIL}</Hyperlink></span>
                  </p>
                </Form>
              </>
            )}
          </Formik>
        </div>
      </div>
    </BaseComponent>
  );
};

ForgotPasswordPage.propTypes = {
  intl: intlShape.isRequired,
  email: PropTypes.string,
  forgotPassword: PropTypes.func.isRequired,
  status: PropTypes.string,
  submitState: PropTypes.string,
};

ForgotPasswordPage.defaultProps = {
  email: '',
  status: null,
  submitState: DEFAULT_STATE,
};

export default connect(
  forgotPasswordResultSelector,
  {
    forgotPassword,
  },
)(injectIntl(ForgotPasswordPage));
