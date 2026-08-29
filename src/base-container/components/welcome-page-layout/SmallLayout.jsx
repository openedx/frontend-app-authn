import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import PropTypes from 'prop-types';

import BrandLogo from '../BrandLogo';
import messages from './messages';

const SmallLayout = ({ fullName }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="min-vw-100 bg-light-200">
      <div className="col-md-12 small-screen-top-stripe" />
      <BrandLogo className="logo-small" variant="default" />
      <div className="d-flex align-items-center m-3.5">
        <div className="small-yellow-line mt-4.5" />
        <div>
          <h1 className="h5 data-hj-suppress">
            {formatMessage(messages['welcome.to.platform'], { siteName: getSiteConfig().siteName, fullName })}
          </h1>
          <h2 className="h1">
            {formatMessage(messages['complete.your.profile.1'])}
            <div className="text-accent-a">
              {formatMessage(messages['complete.your.profile.2'])}
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
};

SmallLayout.propTypes = {
  fullName: PropTypes.string.isRequired,
};

export default SmallLayout;
