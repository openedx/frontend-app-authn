import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';

const ThirdPartyAuthAlert = (props) => {
  const { formatMessage } = useIntl();
  const { currentProvider, referrer } = props;
  const platformName = getConfig().SITE_NAME;
  let message;

  if (referrer === LOGIN_PAGE) {
    message = formatMessage(messages['login.third.party.auth.account.not.linked'], { currentProvider, platformName });
  } else {
    message = formatMessage(messages['register.third.party.auth.account.not.linked'], { currentProvider, platformName });
  }

  if (!currentProvider) {
    return null;
  }

  return (
    <>
      <Alert id="tpa-alert" className={referrer === REGISTER_PAGE ? 'alert-success mt-n2 mb-5' : 'alert-warning mt-n2 mb-5'}>
        {referrer === REGISTER_PAGE ? (
          <Alert.Heading>{formatMessage(messages['tpa.alert.heading'])}</Alert.Heading>
        ) : null}
        <p>{ message }</p>
      </Alert>
      {referrer === REGISTER_PAGE ? (
        <h4 className="mt-4 mb-4">{formatMessage(messages['registration.using.tpa.form.heading'])}</h4>
      ) : null}
    </>
  );
};

ThirdPartyAuthAlert.defaultProps = {
  currentProvider: '',
  referrer: LOGIN_PAGE,
};

ThirdPartyAuthAlert.propTypes = {
  currentProvider: PropTypes.string,
  referrer: PropTypes.string,
};

export default ThirdPartyAuthAlert;
