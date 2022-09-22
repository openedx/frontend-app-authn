import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Form,
} from '@edx/paragon';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import { LOGIN_PAGE, SUPPORTED_ICON_CLASSES } from '../data/constants';
import messages from './messages';

/**
 * This component renders the Single sign-on (SSO) button only for the tpa provider passed
 * */
const EnterpriseSSO = (props) => {
  const { intl } = props;
  const tpaProvider = props.provider;

  const handleSubmit = (e, url) => {
    e.preventDefault();
    window.location.href = getConfig().LMS_BASE_URL + url;
  };

  const handleClick = (e) => {
    e.preventDefault();
    window.location.href = LOGIN_PAGE;
  };

  if (tpaProvider) {
    return (
      <div className="d-flex justify-content-center m-4">
        <div className="d-flex flex-column">
          <div className="mw-450">
            <Form className="m-0">
              <p>{intl.formatMessage(messages['enterprisetpa.title.heading'], { providerName: tpaProvider.name })}</p>
              <Button
                id={tpaProvider.id}
                key={tpaProvider.id}
                type="submit"
                variant="link"
                className={`btn-tpa btn-${tpaProvider.id}`}
                onClick={(e) => handleSubmit(e, tpaProvider.loginUrl)}
              >
                {tpaProvider.iconImage ? (
                  <div aria-hidden="true">
                    <img className="icon-image" src={tpaProvider.iconImage} alt={`icon ${tpaProvider.name}`} />
                    <span className="pl-2" aria-hidden="true">{ tpaProvider.name }</span>
                  </div>
                )
                  : (
                    <>
                      <div className="font-container" aria-hidden="true">
                        <FontAwesomeIcon
                          icon={SUPPORTED_ICON_CLASSES.includes(tpaProvider.iconClass) ? ['fab', tpaProvider.iconClass] : faSignInAlt}
                        />
                      </div>
                      <span className="pl-2" aria-hidden="true">{ tpaProvider.name }</span>
                    </>
                  )}
              </Button>
              <div className="mb-4" />
              <Button
                type="submit"
                variant="outline-primary"
                state="Complete"
                className="w-100"
                onClick={(e) => handleClick(e)}
              >
                {intl.formatMessage(messages['enterprisetpa.login.button.text'])}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
  return <div />;
};

EnterpriseSSO.defaultProps = {
  provider: {
    id: '',
    name: '',
    iconClass: '',
    iconImage: '',
    loginUrl: '',
    registerUrl: '',
  },
};

EnterpriseSSO.propTypes = {
  provider: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    iconClass: PropTypes.string,
    iconImage: PropTypes.string,
    loginUrl: PropTypes.string,
    registerUrl: PropTypes.string,
  }),
  intl: intlShape.isRequired,
};

export default injectIntl(EnterpriseSSO);
