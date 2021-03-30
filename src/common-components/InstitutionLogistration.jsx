import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Button, Hyperlink } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import messages from './messages';

export const RenderInstitutionButton = props => {
  const { onSubmitHandler, secondaryProviders, buttonTitle } = props;
  if (secondaryProviders !== undefined && secondaryProviders.length > 0) {
    return (
      <Button
        className="w-auto mb-3"
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
      <div className="d-flex justify-content-center m-4">
        <div className="flex-column">
          <div className="mt-3">
            <FontAwesomeIcon className="mr-2" icon={faChevronLeft} />
            <Hyperlink
              destination=""
              onClick={onSubmitHandler}
            >
              {buttonTitle}
            </Hyperlink>
          </div>
          <h1 className="mt-3 mb-4 font-weight-normal h3">
            {headingTitle}
          </h1>
          <p className="mb-2">
            {intl.formatMessage(messages['institution.login.page.sub.heading'])}
          </p>
          <div className="mb-2 ml-2">
            <ul>
              {secondaryProviders.map(provider => (
                <li key={provider}>
                  <Hyperlink destination={lmsBaseUrl + provider.loginUrl}>{provider.name}</Hyperlink>
                </li>
              ))}
            </ul>
          </div>
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
