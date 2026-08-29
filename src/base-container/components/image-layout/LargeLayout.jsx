import { useAppConfig, useIntl } from '@openedx/frontend-base';

import './index.scss';
import BrandLogo from '../BrandLogo';
import messages from './messages';

const LargeLayout = () => {
  const { formatMessage } = useIntl();
  const bannerImage = useAppConfig().BANNER_IMAGE_LARGE;

  return (
    <div
      className="w-50 bg-primary-500 banner__image large-layout"
      style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
    >
      <BrandLogo className="company-logo position-absolute" />
      <div className="min-vh-100 p-5 d-flex align-items-end">
        <h1 className="display-2 mw-sm mb-3 d-flex flex-column flex-shrink-0 justify-content-center">
          <span className="text-light-500">
            {formatMessage(messages['your.career.turning.point'])}
          </span>
          <span className="text-warning-300">
            {formatMessage(messages['is.here'])}
          </span>
        </h1>
      </div>
    </div>
  );
};

export default LargeLayout;
