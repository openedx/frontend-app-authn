import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Hyperlink, Icon } from '@openedx/paragon';
import { Institution } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';

/**
 * This component renders the Institution login button
 * */
export const RenderInstitutionButton = props => {
  const { onSubmitHandler, buttonTitle } = props;

  return (
    <Button
      className="btn-sm text-body p-0 mb-4 border-0"
      variant="link"
      data-event-name="institution_login"
      onClick={onSubmitHandler}
    >
      <Icon src={Institution} className="institute-icon" />
      {buttonTitle}
    </Button>
  );
};

/**
 * This component renders the page list of available institutions for login
 * */
const InstitutionLogistration = props => {
  const lmsBaseUrl = getConfig().LMS_BASE_URL;
  const { formatMessage } = useIntl();
  const {
    secondaryProviders,
    headingTitle,
  } = props;

  return (
    <>
      <div className="d-flex justify-content-left mb-4 mt-2">
        <div className="flex-column">
          <h4 className="mb-2 font-weight-bold institutions__heading">
            {headingTitle}
          </h4>
          <p className="mb-2">
            {formatMessage(messages['institution.login.page.sub.heading'])}
          </p>
        </div>
      </div>
      <div className="mb-5">
        <table className="pgn__data-table table-striped table-borderless">
          <tbody>
            {secondaryProviders.map(provider => (
              <tr key={provider} className="pgn__data-table-row">
                <td>
                  <Hyperlink
                    className="btn nav-item p-0 mb-1 institutions--provider-link"
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
  secondaryProviders: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    loginUrl: PropTypes.string.isRequired,
  })),
};

RenderInstitutionButton.propTypes = {
  ...LogistrationProps,
  buttonTitle: PropTypes.string,
  onSubmitHandler: PropTypes.func.isRequired,

};
RenderInstitutionButton.defaultProps = {
  ...LogistrationDefaultProps,
};

InstitutionLogistration.propTypes = {
  ...LogistrationProps,
  headingTitle: PropTypes.string,
};
InstitutionLogistration.defaultProps = {
  ...LogistrationDefaultProps,
  headingTitle: '',
};

export default InstitutionLogistration;
