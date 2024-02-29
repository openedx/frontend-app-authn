import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Form,
  Icon,
} from '@openedx/paragon';
import { Login } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './messages';
import { LOGIN_PAGE, SUPPORTED_ICON_CLASSES } from '../data/constants';

/**
 * This component renders the Single sign-on (SSO) button only for the tpa provider passed
 * */
const EnterpriseSSO = (props) => {
  const { formatMessage } = useIntl();
  const tpaProvider = props.provider;
  const hideRegistrationLink = getConfig().ALLOW_PUBLIC_ACCOUNT_CREATION === false
    || getConfig().SHOW_REGISTRATION_LINKS === false;

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
              <p>{formatMessage(messages['enterprisetpa.title.heading'], { providerName: tpaProvider.name })}</p>
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
                    <img className="btn-tpa__image-icon" src={tpaProvider.iconImage} alt={`icon ${tpaProvider.name}`} />
                    <span className="pl-2" aria-hidden="true">{ tpaProvider.name }</span>
                  </div>
                )
                  : (
                    <>
                      <div className="btn-tpa__font-container" aria-hidden="true">
                        {SUPPORTED_ICON_CLASSES.includes(tpaProvider.iconClass) ? (
                          <FontAwesomeIcon icon={['fab', tpaProvider.iconClass]} />)
                          : (
                            <Icon className="h-75" src={Login} />
                          )}
                      </div>
                      <span className="pl-2" aria-hidden="true">{ tpaProvider.name }</span>
                    </>
                  )}
              </Button>
              <div className="mb-4" />
              <Button
                type="submit"
                id="other-ways-to-sign-in"
                variant="outline-primary"
                state="Complete"
                className="w-100"
                onClick={(e) => handleClick(e)}
              >
                {hideRegistrationLink
                  ? formatMessage(messages['enterprisetpa.login.button.text.public.account.creation.disabled'])
                  : formatMessage(messages['enterprisetpa.login.button.text'])}
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
};

export default EnterpriseSSO;
