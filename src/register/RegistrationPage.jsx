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
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  Form, Hyperlink, Icon, StatefulButton,
} from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { closest } from 'fastest-levenshtein';

import {
  clearUsernameSuggestions, registerNewUser, resetRegistrationForm, fetchRealtimeValidations,
} from './data/actions';
import { FORM_SUBMISSION_ERROR } from './data/constants';
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
  DEFAULT_STATE, PENDING_STATE, REGISTER_PAGE, DEFAULT_TOP_LEVEL_DOMAINS,
  DEFAULT_SERVICE_PROVIDER_DOMAINS, VALID_EMAIL_REGEX, LETTER_REGEX, NUMBER_REGEX,
} from '../data/constants';
import {
  getTpaProvider, getTpaHint, getAllPossibleQueryParam, setSurveyCookie,
} from '../data/utils';

class RegistrationPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    sendPageEvent('login_and_registration', 'register');

    const optionalFields = getConfig().REGISTRATION_OPTIONAL_FIELDS ? getConfig().REGISTRATION_OPTIONAL_FIELDS.split(',') : [];

    this.queryParams = getAllPossibleQueryParam();
    this.tpaHint = getTpaHint();
    this.state = {
      country: '',
      email: '',
      name: '',
      password: '',
      username: '',
      errors: {
        email: '',
        name: '',
        username: '',
        password: '',
        country: '',
      },
      errorCode: null,
      failureCount: 0,
      optionalFields,
      optionalFieldsState: {},
      showOptionalField: false,
      startTime: Date.now(),
      optimizelyExperimentName: '',
    };
  }

  componentDidMount() {
    const payload = { ...this.queryParams };

    if (this.tpaHint) {
      payload.tpa_hint = this.tpaHint;
    }
    this.props.resetRegistrationForm();
    this.props.getThirdPartyAuthContext(payload);
    this.getExperiments();
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.validationDecisions !== nextProps.validationDecisions) {
      const state = { errors: { ...this.state.errors, ...nextProps.validationDecisions } };

      if (nextProps.registrationErrorCode) {
        state.errorCode = nextProps.registrationErrorCode;
      }
      this.setState({ ...state });
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
    const { optimizelyExperimentName } = window;

    if (optimizelyExperimentName) {
      this.setState({ optimizelyExperimentName });
    }
  };

  getCountryOptions = () => [
    { code: '', name: this.props.intl.formatMessage(messages['registration.country.label']) },
  ].concat(getCountryList(getLocale())).map(({ code, name }) => (
    <option className="data-hj-suppress" key={code} value={code}>{name}</option>
  ));

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
    const totalRegistrationTime = (Date.now() - this.state.startTime) / 1000;
    let payload = {
      name: this.state.name,
      username: this.state.username,
      email: this.state.email,
      country: this.state.country,
      honor_code: true,
      is_authn_mfe: true,
    };

    if (this.props.thirdPartyAuthContext.currentProvider) {
      payload.social_auth_provider = this.props.thirdPartyAuthContext.currentProvider;
    } else {
      payload.password = this.state.password;
    }

    let errors = {};
    Object.keys(payload).forEach(key => {
      errors = this.validateInput(key, payload[key], payload);
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
    this.props.registerNewUser(payload);
  }

  handleOnBlur = (e) => {
    const { name, value } = e.target;
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

  handleSuggestionClick = (suggestion) => {
    const { errors } = this.state;
    errors.username = '';
    this.setState({
      username: suggestion,
      errors,
    });
    this.props.clearUsernameSuggestions();
  }

  isFormValid(validations) {
    const keyValidList = Object.entries(validations).map(([key]) => !validations[key]);
    return keyValidList.every((current) => current === true);
  }

  validateInput(fieldName, value, payload) {
    const { errors } = this.state;
    const { intl, statusCode } = this.props;

    const emailRegex = new RegExp(VALID_EMAIL_REGEX, 'i');
    switch (fieldName) {
      case 'email':
        if (!value) {
          errors.email = intl.formatMessage(messages['empty.email.field.error']);
        } else if (value.length <= 2 || !emailRegex.test(value)) {
          errors.email = intl.formatMessage(messages['email.invalid.format.error']);
        } else if (emailRegex.test(value)) {
          errors.email = '';
          let emailLexemes = value.split('@');
          let domainLexemes = emailLexemes[1].split('.');
          const serviceProvider = domainLexemes[0];
          const topLevelDomain = domainLexemes[1];

          if (DEFAULT_TOP_LEVEL_DOMAINS.indexOf(topLevelDomain) < 0) {
            let suggestedTld = closest(topLevelDomain, DEFAULT_TOP_LEVEL_DOMAINS);
            suggestedTld = `${emailLexemes[0]}@${domainLexemes[0]}.${suggestedTld}`;
            errors.email = intl.formatMessage(messages['email.invalid.format.error']);
            suggestedTld = intl.formatMessage(messages['did.you.mean.alert.text'], { email: suggestedTld });
            this.setState({
              suggestedTopLevelDomain: suggestedTld,
              suggestedServiceLevelDomain: '',
              borderClass: '',
            });
            break;
          } else {
            this.setState({ suggestedTopLevelDomain: '' });
          }

          if (DEFAULT_SERVICE_PROVIDER_DOMAINS.indexOf(serviceProvider) < 0) {
            let suggestedSld = closest(serviceProvider, DEFAULT_SERVICE_PROVIDER_DOMAINS);
            suggestedSld = `${emailLexemes[0]}@${suggestedSld}.${domainLexemes[1]}`;
            suggestedSld = intl.formatMessage(messages['did.you.mean.alert.text'], { email: suggestedSld });
            errors.email = '';
            this.setState({
              suggestedServiceLevelDomain: suggestedSld,
              borderClass: 'yellow-border',
            });
          } else {
            this.setState({
              suggestedServiceLevelDomain: '',
              borderClass: '',
            });
          }
          emailLexemes = '';
          domainLexemes = '';
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.email = '';
        }
        break;
      case 'name':
        if (!value) {
          errors.name = intl.formatMessage(messages['empty.name.field.error']);
        } else {
          errors.name = '';
        }
        break;
      case 'username':
        if (!value || value.length <= 1 || value.length > 30) {
          errors.username = intl.formatMessage(messages['username.validation.message']);
        } else if (!value.match(/^[a-zA-Z0-9_-]*$/i)) {
          errors.username = intl.formatMessage(messages['username.format.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.username = '';
        }
        break;
      case 'password':
        if (!value || !LETTER_REGEX.test(value) || !NUMBER_REGEX.test(value) || value.length < 8) {
          errors.password = intl.formatMessage(messages['password.validation.message']);
        } else if (payload && statusCode !== 403) {
          this.props.fetchRealtimeValidations(payload);
        } else {
          errors.password = '';
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
      // Fire optimizely event
      if (this.state.optimizelyExperimentName !== 'progressive_profiling_phase1') {
        window.optimizely = window.optimizely || [];
        window.optimizely.push({
          type: 'event',
          eventName: 'van_504_conversion_rate',
        });
        ['yearOfBirth', 'gender', 'levelOfEducation'].forEach(fieldName => {
          if (this.state[fieldName]) {
            window.optimizely.push({
              type: 'event',
              eventName: `van_504_${fieldName}`,
            });
          }
        });
      }
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
          redirectToWelcomePage={this.state.optimizelyExperimentName === 'progressive_profiling_phase1'}
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
              errorMessage={this.state.errors.name}
              floatingLabel={intl.formatMessage(messages['registration.fullname.label'])}
            />
            <UsernameField
              name="username"
              value={this.state.username}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.username}
              helpText={[intl.formatMessage(messages['help.text.username.1']), intl.formatMessage(messages['help.text.username.2'])]}
              floatingLabel={intl.formatMessage(messages['registration.username.label'])}
              handleSuggestionClick={this.handleSuggestionClick}
              usernameSuggestions={this.props.usernameSuggestions}
            />
            <FormGroup
              name="email"
              value={this.state.email}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.email}
              helpText={[intl.formatMessage(messages['help.text.email'])]}
              floatingLabel={intl.formatMessage(messages['registration.email.label'])}
              borderClass={this.state.borderClass}
              suggestedTopLevelDomain={this.state.suggestedTopLevelDomain}
              suggestedServiceLevelDomain={this.state.suggestedServiceLevelDomain}
            />

            {!currentProvider && (
              <PasswordField
                name="password"
                value={this.state.password}
                handleBlur={this.handleOnBlur}
                handleChange={this.handleOnChange}
                errorMessage={this.state.errors.password}
                floatingLabel={intl.formatMessage(messages['registration.password.label'])}
              />
            )}
            <FormGroup
              as="select"
              name="country"
              value={this.state.country}
              handleBlur={this.handleOnBlur}
              handleChange={this.handleOnChange}
              errorMessage={this.state.errors.country}
              floatingLabel={intl.formatMessage(messages['registration.country.label'])}
              trailingElement={<Icon src={ExpandMore} />}
              options={this.getCountryOptions}
            />
            <div id="honor-code" className="small">
              <FormattedMessage
                id="register.page.terms.of.service.and.honor.code"
                defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                Member process your personal data in accordance with the {privacyPolicy}."
                description="Text that appears on registration form stating honor code and privacy policy"
                values={{
                  platformName: getConfig().SITE_NAME,
                  tosAndHonorCode: (
                    <Hyperlink destination={getConfig().TOS_AND_HONOR_CODE || '#'} target="_blank">
                      {intl.formatMessage(messages['terms.of.service.and.honor.code'])}
                    </Hyperlink>
                  ),
                  privacyPolicy: (
                    <Hyperlink destination={getConfig().PRIVACY_POLICY || '#'} target="_blank">
                      {intl.formatMessage(messages['privacy.policy'])}
                    </Hyperlink>
                  ),
                }}
              />
            </div>
            {getConfig().REGISTRATION_OPTIONAL_FIELDS && this.state.optimizelyExperimentName !== 'progressive_profiling_phase1' ? (
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
              className="register-button-width mt-4 mb-4"
              state={submitState}
              labels={{
                default: intl.formatMessage(messages['create.account.button']),
                pending: '',
              }}
              icons={{
                pending: <FontAwesomeIcon title={intl.formatMessage(messages['create.an.account.btn.pending.state'])} icon={faSpinner} spin />,
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
