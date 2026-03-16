import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';

import { loginPath, registerPath } from '../constants';
import messages from './messages';

const ThirdPartyAuthAlert = (props) => {
  const { formatMessage } = useIntl();
  const { currentProvider, referrer } = props;
  const platformName = getSiteConfig().siteName;
  let message;

  if (referrer === loginPath) {
    message = formatMessage(messages['login.third.party.auth.account.not.linked'], { currentProvider, platformName });
  } else {
    message = formatMessage(messages['register.third.party.auth.account.not.linked'], { currentProvider, platformName });
  }

  if (!currentProvider) {
    return null;
  }

  return (
    <>
      <Alert id="tpa-alert" className={referrer === registerPath ? 'alert-success mt-n2 mb-5' : 'alert-warning mt-n2 mb-5'}>
        {referrer === registerPath ? (
          <Alert.Heading>{formatMessage(messages['tpa.alert.heading'])}</Alert.Heading>
        ) : null}
        <p>{message}</p>
      </Alert>
      {referrer === registerPath ? (
        <h4 className="mt-4 mb-4">{formatMessage(messages['registration.using.tpa.form.heading'])}</h4>
      ) : null}
    </>
  );
};

ThirdPartyAuthAlert.defaultProps = {
  currentProvider: '',
  referrer: loginPath,
};

ThirdPartyAuthAlert.propTypes = {
  currentProvider: PropTypes.string,
  referrer: PropTypes.string,
};

export default ThirdPartyAuthAlert;
