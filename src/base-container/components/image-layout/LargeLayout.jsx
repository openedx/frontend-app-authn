import { useAppConfig, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Hyperlink, Image } from '@openedx/paragon';

import './index.scss';
import messages from './messages';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div
      className="w-50 bg-primary-500 banner__image large-layout"
      style={{ backgroundImage: `url(${useAppConfig().BANNER_IMAGE_LARGE})` }}
    >
      <Hyperlink destination={useAppConfig().MARKETING_SITE_BASE_URL}>
        <Image className="company-logo position-absolute" alt={getSiteConfig().siteName} src={useAppConfig().LOGO_WHITE_URL} />
      </Hyperlink>
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
