import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import {
  Form,
  Icon,
  Spinner,
  StatefulButton,
  Tab,
  Tabs,
} from '@openedx/paragon';
import { ChevronLeft } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

import BaseContainer from '../base-container';
import { PasswordField } from '../common-components';
import {
  LETTER_REGEX, LOGIN_PAGE, NUMBER_REGEX, RESET_PAGE,
} from '../data/constants';
import { getAllPossibleQueryParams, updatePathWithQueryParams, windowScrollTo } from '../data/utils';
import { resetPassword, validateToken } from './data/actions';
import {
  FORM_SUBMISSION_ERROR, PASSWORD_RESET_ERROR, PASSWORD_VALIDATION_ERROR, TOKEN_STATE,
} from './data/constants';
import { resetPasswordResultSelector } from './data/selectors';
import { validatePassword } from './data/service';
import messages from './messages';
import ResetPasswordFailure from './ResetPasswordFailure';

const ResetPasswordPage = (props) => {
  const { formatMessage } = useIntl();
  const newPasswordError = formatMessage(messages['password.validation.message']);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (props.status === PASSWORD_RESET_ERROR) {
      navigate(updatePathWithQueryParams(RESET_PAGE));
    }
    if (props.status === 'success') {
      navigate(updatePathWithQueryParams(LOGIN_PAGE));
    }
    if (props.status !== TOKEN_STATE.PENDING) {
      setErrorCode(props.status);
    }
    if (props.status === PASSWORD_VALIDATION_ERROR) {
      setFormErrors({ newPassword: newPasswordError });
    }
  }, [props.status]);

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
      case 'confirmPassword':
        if (!value) {
          formErrors.confirmPassword = formatMessage(messages['confirm.your.password']);
        } else if (value !== newPassword) {
          formErrors.confirmPassword = formatMessage(messages['passwords.do.not.match']);
        } else {
          formErrors.confirmPassword = '';
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

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;

    setConfirmPassword(value);
    validateInput('confirmPassword', value);
  };

  const handleOnFocus = (e) => {
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPasswordValid = validateInput('newPassword', newPassword);
    const isPasswordConfirmed = validateInput('confirmPassword', confirmPassword);

    if (isPasswordValid && isPasswordConfirmed) {
      const formPayload = {
        new_password1: newPassword,
        new_password2: confirmPassword,
      };
      const params = getAllPossibleQueryParams();
      props.resetPassword(formPayload, props.token, params);
    } else {
      setErrorCode(FORM_SUBMISSION_ERROR);
      windowScrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  const tabTitle = (
    <div className="d-inline-flex flex-wrap align-items-center">
      <Icon src={ChevronLeft} />
      <span className="ml-2">{formatMessage(messages['sign.in'])}</span>
    </div>
  );

  if (props.status === TOKEN_STATE.PENDING && token) {
    props.validateToken(token);
    return (
      <Spinner animation="border" variant="primary" className="spinner--position-centered" />
    );
  } else {
    return (
      <BaseContainer>
        <div>
          <Helmet>
            <title>
              {formatMessage(messages['reset.password.page.title'], { siteName: getSiteConfig().siteName })}
            </title>
          </Helmet>
          <Tabs activeKey="" id="controlled-tab" onSelect={(key) => navigate(updatePathWithQueryParams(key))}>
            <Tab title={tabTitle} eventKey={LOGIN_PAGE} />
          </Tabs>
          <div id="main-content" className="main-content">
            <div className="mw-xs">
              <ResetPasswordFailure errorCode={errorCode} errorMsg={props.errorMsg} />
              <h4>{formatMessage(messages['reset.password'])}</h4>
              <p className="mb-4">{formatMessage(messages['reset.password.page.instructions'])}</p>
              <Form id="set-reset-password-form" name="set-reset-password-form">
                <PasswordField
                  name="newPassword"
                  value={newPassword}
                  handleChange={(e) => setNewPassword(e.target.value)}
                  handleBlur={handleOnBlur}
                  handleFocus={handleOnFocus}
                  errorMessage={formErrors.newPassword}
                  floatingLabel={formatMessage(messages['new.password.label'])}
                />
                <PasswordField
                  name="confirmPassword"
                  value={confirmPassword}
                  handleChange={handleConfirmPasswordChange}
                  handleFocus={handleOnFocus}
                  errorMessage={formErrors.confirmPassword}
                  showRequirements={false}
                  floatingLabel={formatMessage(messages['confirm.password.label'])}
                />
                <StatefulButton
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
          </div>
        </div>
      </BaseContainer>
    );
  }
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
