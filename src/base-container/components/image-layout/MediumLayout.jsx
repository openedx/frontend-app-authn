import { useAppConfig, useIntl } from '@openedx/frontend-base';

import './index.scss';
import BrandLogo from '../BrandLogo';
import messages from './messages';

const MediumLayout = () => {
  const { formatMessage } = useIntl();
  const bannerImage = useAppConfig().BANNER_IMAGE_MEDIUM;

  return (
    <div
      className="w-100 mb-3 bg-primary-500 banner__image medium-layout"
      style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
    >
      <BrandLogo className="company-logo" />
      <div className="ml-5 pb-4 pt-4">
        <h1 className="display-2 banner__heading">
          <span className="text-light-500">
            {formatMessage(messages['your.career.turning.point'])}{' '}
          </span>
          <span className="text-warning-300 d-inline-block">
            {formatMessage(messages['is.here'])}
          </span>
        </h1>
      </div>
    </div>
  );
};

export default MediumLayout;
