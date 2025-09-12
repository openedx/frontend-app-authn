import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';
import { LOGIN_PAGE } from '../data/constants';
import { AlertWrapper } from '../shared/index.ts';

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
    <AlertWrapper id="tpa-alert">
      <p>{ message }</p>
    </AlertWrapper>
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
