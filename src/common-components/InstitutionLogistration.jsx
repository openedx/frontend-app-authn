import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { Hyperlink, Icon } from '@edx/paragon';
import { Institution } from '@edx/paragon/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import messages from './messages';

export const RenderInstitutionButton = props => {
  const { onSubmitHandler, buttonTitle } = props;

  return (
    <Hyperlink className="btn btn-link btn-sm text-body p-0 mb-4" onClick={onSubmitHandler}>
      <Icon src={Institution} className="institute-icon" />
      {buttonTitle}
    </Hyperlink>
  );
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
      <div className="d-flex justify-content-left mb-4 mt-4">
        <div className="flex-column">
          <div className="mt-3">
            <FontAwesomeIcon className="mr-2" icon={faChevronLeft} />
            <Hyperlink
              className="btn nav-item p-0 mb-1"
              onClick={onSubmitHandler}
            >
              {buttonTitle}
            </Hyperlink>
          </div>
          <h3 className="mt-3 mb-2 font-weight-normal institute-heading">
            {headingTitle}
          </h3>
          <p className="mb-2">
            {intl.formatMessage(messages['institution.login.page.sub.heading'])}
          </p>
        </div>
      </div>
      <div className="mb-5">
        <table className="pgn__data-table table-striped table-borderless">
          <tbody>
            {secondaryProviders.map(provider => (
              <tr className="pgn__data-table-row">
                <td>
                  <Hyperlink
                    className="btn nav-item p-0 mb-1"
                    destination={lmsBaseUrl + provider.loginUrl}
                  >
                    {provider.name}
                  </Hyperlink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
