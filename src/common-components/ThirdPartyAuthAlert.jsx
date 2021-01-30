import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { LOGIN_PAGE, REGISTER_PAGE } from '../data/constants';

const ThirdPartyAuthAlert = (props) => {
  const { currentProvider, referrer, platformName } = props;
  let message;

  if (referrer === LOGIN_PAGE) {
    message = (
      <FormattedMessage
        id="login.third.party.auth.account.not.linked.message"
        defaultMessage="You have successfully signed into {currentProvider}, but your {currentProvider} account does not have a linked {platformName} account. To link your accounts, sign in now using your {platformName} password."
        description="Message that appears on login page if user has successfully authenticated with TPA but no associated platform account exists"
        values={{ currentProvider, platformName }}
      />
    );
  } else {
    message = (
      <FormattedMessage
        id="register.third.party.auth.account.not.linked.message"
        defaultMessage="You've successfully signed into {currentProvider}. We just need a little more information before you start learning with {platformName}."
        description="Message that appears on register page if user has successfully authenticated with TPA but no associated platform account exists"
        values={{ currentProvider, platformName }}
      />
    );
  }

  return <Alert id="tpa-alert" className={referrer === REGISTER_PAGE ? 'alert-success mt-n2' : 'alert-warning mt-n2'}>{ message }</Alert>;
};

ThirdPartyAuthAlert.defaultProps = {
  referrer: LOGIN_PAGE,
};

ThirdPartyAuthAlert.propTypes = {
  currentProvider: PropTypes.string.isRequired,
  platformName: PropTypes.string.isRequired,
  referrer: PropTypes.string,
};

export default ThirdPartyAuthAlert;
