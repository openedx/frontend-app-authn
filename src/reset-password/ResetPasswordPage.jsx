import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Spinner,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

import { resetPassword, validateToken } from './data/actions';
import {
  FORM_SUBMISSION_ERROR, PASSWORD_RESET_ERROR, PASSWORD_VALIDATION_ERROR, TOKEN_STATE,
} from './data/constants';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import messages from './messages';
import ResetPasswordFailure from './ResetPasswordFailure';
import BaseContainer from '../base-container';
import { PasswordField } from '../common-components';
import {
  LETTER_REGEX, LOGIN_PAGE, NUMBER_REGEX, RESET_PAGE,
} from '../data/constants';
import { getAllPossibleQueryParams, updatePathWithQueryParams, windowScrollTo } from '../data/utils';
import {
  Description, GlassCard, LMSLogo, StatefulButtonWrapper, Title,
} from '../shared/index.ts';

const ResetPasswordPage = (props) => {
  const { formatMessage } = useIntl();
  const newPasswordError = formatMessage(messages['password.validation.message']);

  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (props.status !== TOKEN_STATE.PENDING && props.status !== PASSWORD_RESET_ERROR) {
      setErrorCode(props.status);
    }
    if (props.status === PASSWORD_VALIDATION_ERROR) {
      setFormErrors({ newPassword: newPasswordError });
    }
  }, [props.status, newPasswordError]);

  const validatePasswordFromBackend = async (password) => {
    let errorMessage = '';
    try {
      const payload = {
        reset_password_page: true,
        password,
      };
      errorMessage = await validatePassword(payload);
    } catch (err) {
      errorMessage = '';
    }
    setFormErrors({ ...formErrors, newPassword: errorMessage });
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'newPassword':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          formErrors.newPassword = formatMessage(messages['password.validation.message']);
        } else {
          validatePasswordFromBackend(value);
        }
        break;
      default:
        break;
    }
    setFormErrors({ ...formErrors });
    return !Object.values(formErrors).some(x => (x !== ''));
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    validateInput(name, value);
  };

  const handleOnFocus = (e) => {
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPasswordValid = validateInput('newPassword', newPassword);

    if (isPasswordValid) {
      const formPayload = {
        new_password1: newPassword,
        new_password2: newPassword,
      };
      const params = getAllPossibleQueryParams();
      props.resetPassword(formPayload, props.token, params);
    } else {
      setErrorCode(FORM_SUBMISSION_ERROR);
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  if (props.status === TOKEN_STATE.PENDING) {
    if (token) {
      props.validateToken(token);
      return (
        <BaseContainer>
          <GlassCard className="!tw-w-[576px] !tw-h-fit tw-p-8 tw-flex tw-flex-col tw-gap-12">
            <LMSLogo />
            <div className="tw-flex tw-flex-col tw-gap-8 tw-items-center">
              <Spinner animation="border" variant="primary" />
              <Description message={formatMessage(messages['verifying.token'])} />
            </div>
          </GlassCard>
        </BaseContainer>
      );
    }
  } else if (props.status === PASSWORD_RESET_ERROR) {
    navigate(updatePathWithQueryParams(RESET_PAGE));
  } else if (props.status === 'success') {
    navigate(updatePathWithQueryParams(LOGIN_PAGE));
  } else {
    return (
      <BaseContainer>
        <GlassCard className="!tw-w-[576px] !tw-h-fit tw-p-8 tw-flex tw-flex-col tw-gap-12">
          <Helmet>
            <title>
              {formatMessage(messages['reset.password.page.title'], { siteName: getConfig().SITE_NAME })}
            </title>
          </Helmet>
          <LMSLogo />
          <div className="tw-flex tw-flex-col tw-gap-8 tw-w-full">
            <div className="tw-text-center tw-flex tw-flex-col tw-gap-3">
              <Title message={formatMessage(messages['reset.password.page.title'])} />
              <div className="tw-flex tw-flex-col tw-gap-1">
                <Description message={formatMessage(messages['reset.password.page.instructions'])} />
                <Description message={formatMessage(messages['reset.password.page.instructions.2'])} />
              </div>
            </div>
            <ResetPasswordFailure errorCode={errorCode} errorMsg={props.errorMsg} />
            <Form id="set-reset-password-form" name="set-reset-password-form" className="tw-flex tw-flex-col tw-gap-6 tw-w-full">
              <PasswordField
                name="newPassword"
                value={newPassword}
                handleChange={(e) => setNewPassword(e.target.value)}
                handleBlur={handleOnBlur}
                handleFocus={handleOnFocus}
                errorMessage={formErrors.newPassword}
                label={formatMessage(messages['new.password.label'])}
                floatingLabel={formatMessage(messages['new.password.label'])}
                placeholder={formatMessage(messages['new.password.placeholder'])}
              />
              <StatefulButtonWrapper
                id="submit-new-password"
                name="submit-new-password"
                type="submit"
                variant="brand"
                className="reset-password--button"
                state={props.status}
                labels={{
                  default: formatMessage(messages['reset.password']),
                  pending: '',
                }}
                onClick={e => handleSubmit(e)}
                onMouseDown={(e) => e.preventDefault()}
              />
            </Form>
          </div>
        </GlassCard>
      </BaseContainer>
    );
  }
  return null;
};

ResetPasswordPage.defaultProps = {
  status: null,
  token: null,
  errorMsg: null,
};

ResetPasswordPage.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  validateToken: PropTypes.func.isRequired,
  token: PropTypes.string,
  status: PropTypes.string,
  errorMsg: PropTypes.string,
};

export default connect(
  resetPasswordResultSelector,
  {
    resetPassword,
    validateToken,
  },
)(ResetPasswordPage);
