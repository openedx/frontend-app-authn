import { useAppConfig, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Hyperlink, Image } from '@openedx/paragon';

import messages from './messages';

const ExtraSmallLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <span
      className="w-100 bg-primary-500 banner__image extra-small-layout"
      style={{ backgroundImage: `url(${useAppConfig().BANNER_IMAGE_EXTRA_SMALL})` }}
    >
      <Hyperlink destination={useAppConfig().MARKETING_SITE_BASE_URL}>
        <Image className="company-logo" alt={getSiteConfig().siteName} src={useAppConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="ml-4.5 mr-1 pb-3.5 pt-3.5">
        <h1 className="banner__heading">
          <span className="text-light-500">
            {formatMessage(messages['your.career.turning.point'])}{' '}
          </span>
          <span className="text-warning-300">
            {formatMessage(messages['is.here'])}
          </span>
        </h1>
      </div>
    </span>
  );
};

export default ExtraSmallLayout;
