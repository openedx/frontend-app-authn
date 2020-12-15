import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import messages from './messages';

export const RenderInstitutionButton = props => {
  const { onSubmitHandler, secondaryProviders, buttonTitle } = props;
  if (secondaryProviders !== undefined && secondaryProviders.length > 0) {
    return (
      <Button
        className="mb-2"
        block
        variant="outline-primary"
        onClick={onSubmitHandler}
      >
        {buttonTitle}
      </Button>
    );
  }
  return <></>;
};

const InstitutionLogistration = props => {
  const lmsBaseUrl = getConfig().LMS_BASE_URL;
  const {
    intl,
    onSubmitHandler,
    secondaryProviders,
    headingTitle,
    buttonTitle,
  } = props;

  return (
    <>
      <div className="d-flex justify-content-center institution-login-container">
        <div className="d-flex flex-column" style={{ width: '450px' }}>
          <p className="mt-5 ml-3 mb-4" style={{ color: '#23419f', fontSize: '20px' }}>
            {headingTitle}
          </p>
          <div style={{ fontSize: '16px' }}>
            <p
              className="mb-2"
              style={{ fontSize: '16px' }}
            >
              {intl.formatMessage(messages['logistration.institution.login.page.sub.heading'])}
            </p>
            <div className="mb-2 ml-2">
              <ul>
                {secondaryProviders.map(
                  provider => <li key={provider}><a href={lmsBaseUrl + provider.loginUrl}>{provider.name}</a></li>,
                )}
              </ul>
            </div>
          </div>
          <div className="section-heading-line mb-4">
            <h4>or</h4>
          </div>
          <Button
            variant="outline-primary"
            onClick={onSubmitHandler}
          >
            {buttonTitle}
          </Button>
        </div>
      </div>
    </>
  );
};

const LogistrationDefaultProps = {
  secondaryProviders: [],
  buttonTitle: '',
};
const LogistrationProps = {
  onSubmitHandler: PropTypes.func.isRequired,
  secondaryProviders: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequried,
    loginUrl: PropTypes.string.isRequired,
  })),
  buttonTitle: PropTypes.string,
};

RenderInstitutionButton.propTypes = {
  ...LogistrationProps,
};
RenderInstitutionButton.defaultProps = {
  ...LogistrationDefaultProps,
};

InstitutionLogistration.propTypes = {
  ...LogistrationProps,
  intl: intlShape.isRequired,
  headingTitle: PropTypes.string,
};
InstitutionLogistration.defaultProps = {
  ...LogistrationDefaultProps,
  headingTitle: '',
};

export default injectIntl(InstitutionLogistration);
