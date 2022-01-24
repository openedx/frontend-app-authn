import React from 'react';

import snakeCase from 'lodash.snakecase';
import { connect } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import { Helmet } from 'react-helmet';
import PropTypes, { string } from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { sendPageEvent, sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  injectIntl, intlShape, getCountryList, getLocale, FormattedMessage,
} from '@edx/frontend-platform/i18n';
import {
  Alert, Form, Hyperlink, StatefulButton, Icon,
} from '@edx/paragon';
import { Error, Close } from '@edx/paragon/icons';

import {
  clearUsernameSuggestions, registerNewUser, resetRegistrationForm, fetchRealtimeValidations,
} from './data/actions';
import {
  FORM_SUBMISSION_ERROR, DEFAULT_SERVICE_PROVIDER_DOMAINS, DEFAULT_TOP_LEVEL_DOMAINS, COMMON_EMAIL_PROVIDERS,
} from './data/constants';
import {
  registrationErrorSelector, registrationRequestSelector, validationsSelector, usernameSuggestionsSelector,
} from './data/selectors';
import messages from './messages';
import OptionalFields from './OptionalFields';
import RegistrationFailure from './RegistrationFailure';
import UsernameField from './UsernameField';

import {
  RedirectLogistration, SocialAuthProviders, ThirdPartyAuthAlert, RenderInstitutionButton,
  InstitutionLogistration, FormGroup, PasswordField,
} from '../common-components';
import { getThirdPartyAuthContext } from '../common-components/data/actions';
import { thirdPartyAuthContextSelector } from '../common-components/data/selectors';
import EnterpriseSSO from '../common-components/EnterpriseSSO';
import {
  DEFAULT_STATE, PENDING_STATE, REGISTER_PAGE, VALID_EMAIL_REGEX, LETTER_REGEX, NUMBER_REGEX, VALID_NAME_REGEX,
} from '../data/constants';
import {
  getTpaProvider, getTpaHint, getAllPossibleQueryParam, setSurveyCookie, setCookie,
} from '../data/utils';
import CountryDropdown from './CountryDropdown';
import { getLevenshteinSuggestion, getSuggestionForInvalidEmail } from './utils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    sendPageEvent('login_and_registration', 'register');
    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS ? getConfig().REGISTRATION_OPTIONAL_FIELDS.split(',') : [];
    this.handleOnClose = this.handleOnClose.bind(this);

    this.queryParams = getAllPossibleQueryParam();
    this.tpaHint = getTpaHint();
    this.state = {
      country: '',
      email: '',
      name: '',
      password: '',
      username: '',
      marketingOptIn: true,
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      },
      emailErrorSuggestion: null,
      emailWarningSuggestion: null,
      errorCode: null,
      failureCount: 0,
      optionalFields,
      optionalFieldsState: {},
      showOptionalField: false,
      startTime: Date.now(),
      totalRegistrationTime: 0,
      optimizelyExperimentName: '', // eslint-disable-line react/no-unused-state
      readOnly: true,
      validatePassword: false,
      // TODO: Remove after VAN-704 is complete
      registerRenameExpVariation: '',
    };
  }

  componentDidMount() {
    window.optimizely = window.optimizely || [];
    window.optimizely.push({
      type: 'page',
      pageName: 'authn_registration_page',
      isActive: true,
    });

    const payload = { ...this.queryParams };

    if (payload.save_for_later === 'true') {
      sendTrackEvent('edx.bi.user.saveforlater.course.enroll.clicked', { category: 'save-for-later' });
    }

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.resetRegistrationForm();
    this.props.getThirdPartyAuthContext(payload);
    this.getExperiments();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.usernameSuggestions.length > 0 && this.state.username === '') {
      this.setState({
        username: ' ',
      });
      return false;
    }
    if (this.props.validationDecisions !== nextProps.validationDecisions) {
      const state = { errors: { ...this.state.errors, ...nextProps.validationDecisions } };
      let validatePassword = false;

      if (state.errors.password) {
        validatePassword = true;
      }
      if (nextProps.registrationErrorCode) {
        state.errorCode = nextProps.registrationErrorCode;
      }
      let {
        suggestedTldMessage,
        suggestedTopLevelDomain,
        suggestedSldMessage,
        suggestedServiceLevelDomain,

      } = this.state;
      if (state.errors.email) {
        suggestedTldMessage = '';
        suggestedTopLevelDomain = '';
        suggestedSldMessage = '';
        suggestedServiceLevelDomain = '';
      }
      this.setState({
        ...state,
        suggestedTldMessage,
        suggestedTopLevelDomain,
        suggestedSldMessage,
        suggestedServiceLevelDomain,
        validatePassword,
      });
      return false;
    }

    if (this.props.registrationErrorCode !== nextProps.registrationErrorCode) {
      this.setState({ errorCode: nextProps.registrationErrorCode });
      return false;
    }

    if (this.props.thirdPartyAuthContext.pipelineUserDetails !== nextProps.thirdPartyAuthContext.pipelineUserDetails) {
      this.setState({
        ...nextProps.thirdPartyAuthContext.pipelineUserDetails,
        country: nextProps.thirdPartyAuthContext.countryCode || '',
      });
      return false;
    }

    if (this.props.thirdPartyAuthContext.countryCode !== nextProps.thirdPartyAuthContext.countryCode) {
      this.setState({
        country: nextProps.thirdPartyAuthContext.countryCode || '',
      });
      return false;
    }

    return true;
  }

  getExperiments = () => {
    const { experimentName, renameRegisterExperiment } = window;

    if (experimentName) {
      // eslint-disable-next-line react/no-unused-state
      this.setState({ optimizelyExperimentName: experimentName });
    }

    if (renameRegisterExperiment) {
      this.setState({ registerRenameExpVariation: renameRegisterExperiment });
    }
  };

  getOptionalFields() {
    return (
      <OptionalFields
        optionalFields={this.state.optionalFields}
        values={this.state.optionalFieldsState}
        onChangeHandler={
          (fieldName, value) => {
            this.setState(prevState => ({
              optionalFieldsState: { ...prevState.optionalFieldsState, [fieldName]: value },
            }));
          }
        }
      />
    );
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { startTime } = this.state;
    const totalRegistrationTime = (Date.now() - startTime) / 1000;
    let payload = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      country: this.state.country,
      honor_code: true,
      is_authn_mfe: true,
    };

    if (getConfig().MARKETING_EMAILS_OPT_IN) {
      payload.marketing_emails_opt_in = this.state.marketingOptIn;
    }

    if (this.props.thirdPartyAuthContext.currentProvider) {
      payload.social_auth_provider = this.props.thirdPartyAuthContext.currentProvider;
    } else {
      payload.password = this.state.password;
    }

    let errors = {};
    Object.keys(payload).forEach(key => {
      errors = this.validateInput(key, payload[key], { ...payload, form_field_key: key }, 'handleSubmit');
    });

    if (!this.isFormValid(errors)) {
      this.setState(prevState => ({
        errorCode: FORM_SUBMISSION_ERROR,
        failureCount: prevState.failureCount + 1,
      }));
      return;
    }

    // Since optional fields and query params are not validated we can add it to payload after
    // required fields have been validated. This will save us unwanted calls to validateInput()
    payload = { ...payload, ...this.queryParams };
    this.state.optionalFields.forEach((key) => {
      if (this.state.optionalFieldsState[key]) {
        payload[snakeCase(key)] = this.state.optionalFieldsState[key];
      }
    });

    payload.totalRegistrationTime = totalRegistrationTime;
    this.setState({
      totalRegistrationTime,
    }, () => {
      this.props.registerNewUser(payload);
    });
  }

  handleOnBlur = (e) => {
    let { name, value } = e.target;
    if (name === 'passwordValidation') {
      name = 'password';
      value = this.state.password;
    }
    const payload = {
      is_authn_mfe: true,
      form_field_key: name,
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      honor_code: true,
      country: this.state.country,
    };
    this.validateInput(name, value, payload);
  }

  handleOnChange = (e) => {
    if (e.target.name === 'optionalFields') {
      sendTrackEvent('edx.bi.user.register.optional_fields_selected', {});
      this.setState({
        showOptionalField: e.target.checked,
      });
    } else if (!(e.target.name === 'username' && e.target.value.length > 30)) {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  }

  handleOnFocus = (e) => {
    const { errors } = this.state;
    errors[e.target.name] = '';
    const state = { errors };
    if (e.target.name === 'username') {
      this.props.clearUsernameSuggestions();
    }
    if (e.target.name === 'country') {
      state.readOnly = false;
    }
    if (e.target.name === 'passwordValidation') {
      state.errors.password = '';
    }
    this.setState({ ...state });
  }

  handleSuggestionClick = (e, suggestion) => {
    const { errors } = this.state;
    if (e.target.name === 'username') {
      errors.username = '';
      this.setState({
        username: suggestion,
        errors,
      });
      this.props.clearUsernameSuggestions();
    } else if (e.target.name === 'email') {
      e.preventDefault();
      errors.email = '';
      this.setState({
        borderClass: '',
        email: suggestion,
        emailErrorSuggestion: null,
        emailWarningSuggestion: null,
        errors,
      });
    }
  }

  handleUsernameSuggestionClose = () => {
    this.setState({
      username: '',
    });
    this.props.clearUsernameSuggestions();
  }

  isFormValid(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => !validations[key]);
    return keyValidList.every((current) => current === true);
  }

  validateInput(fieldName, value, payload, callee = null) {
    const { errors } = this.state;
    const { intl, statusCode } = this.props;
    const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
    const urlRegex = new RegExp(VALID_NAME_REGEX);

    switch (fieldName) {
      case 'email':
        if (!value) {
          errors.email = intl.formatMessage(messages['empty.email.field.error']);
        } else if (value.length <= 2) {
          errors.email = intl.formatMessage(messages['email.invalid.format.error']);
        } else {
          let emailWarningSuggestion = null;
          let emailErrorSuggestion = null;

          const [username, domainName] = value.split('@');

          // Check if email address is invalid. If we have a suggestion for invalid email provide that along with
          // error message.
          if (!emailRegex.test(value)) {
            errors.email = intl.formatMessage(messages['email.invalid.format.error']);
            emailErrorSuggestion = getSuggestionForInvalidEmail(domainName, username);
          } else {
            let suggestion = null;
            const hasMultipleSubdomains = value.match(/\./g).length > 1;
            const [serviceLevelDomain, topLevelDomain] = domainName.split('.');
            const tldSuggestion = !DEFAULT_TOP_LEVEL_DOMAINS.includes(topLevelDomain);
            const serviceSuggestion = getLevenshteinSuggestion(serviceLevelDomain, DEFAULT_SERVICE_PROVIDER_DOMAINS, 2);

            if (DEFAULT_SERVICE_PROVIDER_DOMAINS.includes(serviceSuggestion || serviceLevelDomain)) {
              suggestion = `${username}@${serviceSuggestion || serviceLevelDomain}.com`;
            }

            if (!hasMultipleSubdomains && tldSuggestion) {
              emailErrorSuggestion = suggestion;
            } else if (serviceSuggestion) {
              emailWarningSuggestion = suggestion;
            } else {
              suggestion = getLevenshteinSuggestion(domainName, COMMON_EMAIL_PROVIDERS, 3);
              if (suggestion) {
                emailWarningSuggestion = `${username}@${suggestion}`;
              }
            }

            if (!hasMultipleSubdomains && tldSuggestion) {
              errors.email = intl.formatMessage(messages['email.invalid.format.error']);
            } else if (payload && statusCode !== 403) {
              this.props.fetchRealtimeValidations(payload);
            } else {
              errors.email = '';
            }
          }
          this.setState({
            emailWarningSuggestion,
            emailErrorSuggestion,
            borderClass: emailWarningSuggestion ? 'yellow-border' : null,
          });
        }
        break;
      case 'name':
        if (!value) {
          errors.name = intl.formatMessage(messages['empty.name.field.error']);
        } else if (value && value.match(urlRegex)) {
          errors.name = intl.formatMessage(messages['name.validation.message']);
        } else {
          errors.name = '';
        }

        if (!this.state.username.trim() && value) {
          // fetch username suggestions based on the full name
          this.props.fetchRealtimeValidations(payload);
        }
        break;
      case 'username':
        if (value === ' ' && this.props.usernameSuggestions.length > 0 && callee !== 'handleSubmit') {
          errors.username = '';
          break;
        }
        if (!value || value.length <= 1 || value.length > 30) {
          errors.username = intl.formatMessage(messages['username.validation.message']);
        } else if (!value.match(/^[a-zA-Z0-9_-]*$/i)) {
          errors.username = intl.formatMessage(messages['username.format.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.username = '';
        }
        if (this.state.validatePassword) {
          this.props.fetchRealtimeValidations({ ...payload, form_field_key: 'password' });
        }
        break;
      case 'password':
        errors.password = '';
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          errors.password = intl.formatMessage(messages['password.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        }
        break;
      case 'country':
        if (!value) {
          errors.country = intl.formatMessage(messages['empty.country.field.error']);
        } else {
          errors.country = '';
        }
        break;
      default:
        break;
    }

    this.setState({ errors });
    return errors;
  }

  handleOnClose() {
    this.setState({ emailErrorSuggestion: null });
  }

  renderEmailFeedback() {
    if (this.state.emailErrorSuggestion) {
      return (
        <Alert variant="danger" className="email-error-alert" icon={Error}>
          <span className="alert-text">
            {this.props.intl.formatMessage(messages['did.you.mean.alert.text'])}{' '}
            <Alert.Link
              href="#"
              name="email"
              onClick={e => { this.handleSuggestionClick(e, this.state.emailErrorSuggestion); }}
            >
              {this.state.emailErrorSuggestion}
            </Alert.Link>?<Icon src={Close} className="alert-close" onClick={this.handleOnClose} tabIndex="0" />
          </span>
        </Alert>
      );
    }
    if (this.state.emailWarningSuggestion) {
      return (
        <span className="small">
          {this.props.intl.formatMessage(messages['did.you.mean.alert.text'])}:{' '}
          <Alert.Link
            href="#"
            name="email"
            className="email-warning-alert-link"
            onClick={e => { this.handleSuggestionClick(e, this.state.emailWarningSuggestion); }}
          >
            {this.state.emailWarningSuggestion}
          </Alert.Link>?
        </span>
      );
    }

    return null;
  }

  renderThirdPartyAuth(providers, secondaryProviders, currentProvider, thirdPartyAuthApiStatus, intl) {
    const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
    const isSocialAuthActive = !!providers.length && !currentProvider;
    const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;

    return (
      <>
        {((isEnterpriseLoginDisabled && isInstitutionAuthActive) || isSocialAuthActive) && (
          <div className="mt-4 mb-3 h4">
            {intl.formatMessage(messages['registration.other.options.heading'])}
          </div>
        )}

        {thirdPartyAuthApiStatus === PENDING_STATE ? (
          <Skeleton className="tpa-skeleton" height={36} count={2} />
        ) : (
          <>
            {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
              <RenderInstitutionButton
                onSubmitHandler={this.props.handleInstitutionLogin}
                buttonTitle={intl.formatMessage(messages['register.institution.login.button'])}
              />
            )}
            {isSocialAuthActive && (
              <div className="row m-0">
                <SocialAuthProviders socialAuthProviders={providers} referrer={REGISTER_PAGE} />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  renderForm(currentProvider,
    providers,
    secondaryProviders,
    thirdPartyAuthApiStatus,
    finishAuthUrl,
    submitState,
    intl) {
    if (this.props.institutionLogin) {
      return (
        <InstitutionLogistration
          secondaryProviders={this.props.thirdPartyAuthContext.secondaryProviders}
          headingTitle={intl.formatMessage(messages['register.institution.login.page.title'])}
        />
      );
    }

    if (this.props.registrationResult.success) {
      setSurveyCookie('register');
      setCookie(getConfig().REGISTER_CONVERSION_COOKIE_NAME, true);
      setCookie('authn-returning-user');

      // Fire optimizely events
      window.optimizely = window.optimizely || [];
      window.optimizely.push({
        type: 'event',
        eventName: 'authn-register-conversion',
        tags: {
          value: this.state.totalRegistrationTime,
        },
      });
    }

    return (
      <>
        <Helmet>
          <title>{intl.formatMessage(messages['register.page.title'],
            { siteName: getConfig().SITE_NAME })}
          </title>
        </Helmet>
        <RedirectLogistration
          success={this.props.registrationResult.success}
          redirectUrl={this.props.registrationResult.redirectUrl}
          finishAuthUrl={finishAuthUrl}
          redirectToWelcomePage={getConfig().ENABLE_PROGRESSIVE_PROFILING}
        />
        <div className="mw-xs mt-3">
          {this.state.errorCode ? (
            <RegistrationFailure
              errorCode={this.state.errorCode}
              failureCount={this.state.failureCount}
              context={{ provider: currentProvider }}
            />
          ) : null}
          {currentProvider && (
            <>
              <ThirdPartyAuthAlert
                currentProvider={currentProvider}
                platformName={this.props.thirdPartyAuthContext.platformName}
                referrer={REGISTER_PAGE}
              />
              <h4 className="mt-4 mb-4">{intl.formatMessage(messages['registration.using.tpa.form.heading'])}</h4>
            </>
          )}
          <Form>
            <FormGroup
              name="name"
              value={this.state.name}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              handleFocus={this.handleOnFocus}
              errorMessage={this.state.errors.name}
              helpText={[intl.formatMessage(messages['help.text.name'])]}
              floatingLabel={intl.formatMessage(messages['registration.fullname.label'])}
            />
            <FormGroup
              name="email"
              value={this.state.email}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.email}
              handleFocus={this.handleOnFocus}
              helpText={[intl.formatMessage(messages['help.text.email'])]}
              floatingLabel={intl.formatMessage(messages['registration.email.label'])}
              borderClass={this.state.borderClass}
            >
              {this.renderEmailFeedback()}
            </FormGroup>

            <UsernameField
              name="username"
              value={this.state.username}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              handleFocus={this.handleOnFocus}
              errorMessage={this.state.errors.username}
              helpText={[intl.formatMessage(messages['help.text.username.1']), intl.formatMessage(messages['help.text.username.2'])]}
              floatingLabel={intl.formatMessage(messages['registration.username.label'])}
              handleSuggestionClick={this.handleSuggestionClick}
              usernameSuggestions={this.props.usernameSuggestions}
              handleUsernameSuggestionClose={this.handleUsernameSuggestionClose}
            />

            {!currentProvider && (
              <PasswordField
                name="password"
                value={this.state.password}
                handleBlur={this.handleOnBlur}
                handleChange={this.handleOnChange}
                handleFocus={this.handleOnFocus}
                errorMessage={this.state.errors.password}
                floatingLabel={intl.formatMessage(messages['registration.password.label'])}
              />
            )}
            <CountryDropdown
              name="country"
              floatingLabel={intl.formatMessage(messages['registration.country.label'])}
              options={getCountryList(getLocale())}
              valueKey="code"
              displayValueKey="name"
              value={this.state.country}
              handleBlur={this.handleOnBlur}
              handleFocus={this.handleOnFocus}
              errorMessage={intl.formatMessage(messages['empty.country.field.error'])}
              handleChange={(value) => this.setState({ country: value })}
              errorCode={this.state.errorCode}
              readOnly={this.state.readOnly}
            />
            {(getConfig().MARKETING_EMAILS_OPT_IN)
            && (
              <Form.Checkbox
                className="opt-checkbox"
                name="marketing_emails_opt_in"
                checked={this.state.marketingOptIn}
                onChange={(e) => this.setState({ marketingOptIn: e.target.checked })}
              >
                {intl.formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME })}
              </Form.Checkbox>
            )}
            <div id="honor-code" className="micro text-muted mt-4">
              <FormattedMessage
                id="register.page.terms.of.service.and.honor.code"
                defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                Member process your personal data in accordance with the {privacyPolicy}."
                description="Text that appears on registration form stating honor code and privacy policy"
                values={{
                  platformName: getConfig().SITE_NAME,
                  tosAndHonorCode: (
                    <Hyperlink variant="muted" destination={getConfig().TOS_AND_HONOR_CODE || '#'} target="_blank">
                      {intl.formatMessage(messages['terms.of.service.and.honor.code'])}
                    </Hyperlink>
                  ),
                  privacyPolicy: (
                    <Hyperlink variant="muted" destination={getConfig().PRIVACY_POLICY || '#'} target="_blank">
                      {intl.formatMessage(messages['privacy.policy'])}
                    </Hyperlink>
                  ),
                }}
              />
            </div>
            {getConfig().REGISTRATION_OPTIONAL_FIELDS ? (
              <Form.Group className="mb-0 mt-2 small">
                <Form.Check
                  id="optional-field-checkbox"
                  type="checkbox"
                  name="optionalFields"
                  value={this.state.showOptionalField}
                  onClick={this.handleOnChange}
                  onChange={this.handleOnChange}
                  label={intl.formatMessage(messages['support.education.research'])}
                />
              </Form.Group>
            ) : null}
            { this.state.showOptionalField ? this.getOptionalFields() : null }
            <StatefulButton
              type="submit"
              variant="brand"
              className="stateful-button-width mt-4 mb-4"
              state={submitState}
              labels={{
                default: this.state.registerRenameExpVariation === 'variation2' ? (
                  intl.formatMessage(messages['register.for.free.button'])
                ) : intl.formatMessage(messages['create.account.button']),
                pending: '',
              }}
              onClick={this.handleSubmit}
              onMouseDown={(e) => e.preventDefault()}
            />
            {this.renderThirdPartyAuth(providers,
              secondaryProviders,
              currentProvider,
              thirdPartyAuthApiStatus,
              intl)}
          </Form>
          {(this.state.optimizelyExperimentName === 'variation1' || this.state.optimizelyExperimentName === 'variation2')
            ? (
              <div id="certificate-msg" className="mt-4 mb-3 micro text-gray-500">
                {intl.formatMessage(messages['certificate.msg'])}
              </div>
            )
            : null}
        </div>
      </>
    );
  }

  render() {
    const { intl, submitState, thirdPartyAuthApiStatus } = this.props;
    const {
      currentProvider, finishAuthUrl, providers, secondaryProviders,
    } = this.props.thirdPartyAuthContext;

    if (this.tpaHint) {
      if (thirdPartyAuthApiStatus === PENDING_STATE) {
        return <Skeleton height={36} />;
      }
      const { provider, skipHintedLogin } = getTpaProvider(this.tpaHint, providers, secondaryProviders);
      if (skipHintedLogin) {
        window.location.href = getConfig().LMS_BASE_URL + provider.registerUrl;
        return null;
      }
      return provider ? (<EnterpriseSSO provider={provider} intl={intl} />)
        : this.renderForm(
          currentProvider,
          providers,
          secondaryProviders,
          thirdPartyAuthApiStatus,
          finishAuthUrl,
          submitState,
          intl,
        );
    }
    return this.renderForm(
      currentProvider,
      providers,
      secondaryProviders,
      thirdPartyAuthApiStatus,
      finishAuthUrl,
      submitState,
      intl,
    );
  }
}

RegistrationPage.defaultProps = {
  registrationResult: null,
  registerNewUser: null,
  registrationErrorCode: null,
  submitState: DEFAULT_STATE,
  thirdPartyAuthApiStatus: 'pending',
  thirdPartyAuthContext: {
    currentProvider: null,
    finishAuthUrl: null,
    countryCode: null,
    providers: [],
    secondaryProviders: [],
    pipelineUserDetails: null,
  },
  validationDecisions: null,
  statusCode: null,
  usernameSuggestions: [],
};

RegistrationPage.propTypes = {
  intl: intlShape.isRequired,
  getThirdPartyAuthContext: PropTypes.func.isRequired,
  registerNewUser: PropTypes.func,
  resetRegistrationForm: PropTypes.func.isRequired,
  registrationResult: PropTypes.shape({
    redirectUrl: PropTypes.string,
    success: PropTypes.bool,
  }),
  registrationErrorCode: PropTypes.string,
  submitState: PropTypes.string,
  thirdPartyAuthApiStatus: PropTypes.string,
  thirdPartyAuthContext: PropTypes.shape({
    currentProvider: PropTypes.string,
    platformName: PropTypes.string,
    providers: PropTypes.array,
    secondaryProviders: PropTypes.array,
    finishAuthUrl: PropTypes.string,
    countryCode: PropTypes.string,
    pipelineUserDetails: PropTypes.shape({
      email: PropTypes.string,
      fullname: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string,
    }),
  }),
  fetchRealtimeValidations: PropTypes.func.isRequired,
  validationDecisions: PropTypes.shape({
    country: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    password: PropTypes.string,
    username: PropTypes.string,
  }),
  clearUsernameSuggestions: PropTypes.func.isRequired,
  statusCode: PropTypes.number,
  usernameSuggestions: PropTypes.arrayOf(string),
  institutionLogin: PropTypes.bool.isRequired,
  handleInstitutionLogin: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const registrationResult = registrationRequestSelector(state);
  const thirdPartyAuthContext = thirdPartyAuthContextSelector(state);
  return {
    registrationErrorCode: registrationErrorSelector(state),
    submitState: state.register.submitState,
    thirdPartyAuthApiStatus: state.commonComponents.thirdPartyAuthApiStatus,
    registrationResult,
    thirdPartyAuthContext,
    validationDecisions: validationsSelector(state),
    statusCode: state.register.statusCode,
    usernameSuggestions: usernameSuggestionsSelector(state),
  };
};

export default connect(
  mapStateToProps,
  {
    getThirdPartyAuthContext,
    fetchRealtimeValidations,
    registerNewUser,
    resetRegistrationForm,
    clearUsernameSuggestions,
  },
)(injectIntl(RegistrationPage));
