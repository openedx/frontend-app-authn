import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';
import messages from './messages';

const ThirdPartyAuthAlert = (props) => {
  const { currentProvider, intl, referrer } = props;
  const platformName = getConfig().SITE_NAME;
  let message;

  if (referrer === LOGIN_PAGE) {
    message = intl.formatMessage(messages['login.third.party.auth.account.not.linked'], { currentProvider, platformName });
  } else {
    message = intl.formatMessage(messages['register.third.party.auth.account.not.linked'], { currentProvider, platformName });
  }

  return (
    <Alert id="tpa-alert" className={referrer === REGISTER_PAGE ? 'alert-success mt-n2' : 'alert-warning mt-n2'}>
      {referrer === REGISTER_PAGE ? (
        <Alert.Heading>{intl.formatMessage(messages['tpa.alert.heading'])}</Alert.Heading>
      ) : null}
      <p>{ message }</p>
    </Alert>
  );
};

ThirdPartyAuthAlert.defaultProps = {
  referrer: LOGIN_PAGE,
};

ThirdPartyAuthAlert.propTypes = {
  currentProvider: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  referrer: PropTypes.string,
};

export default injectIntl(ThirdPartyAuthAlert);
