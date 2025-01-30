import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';
import backgroundImage from './background.png'
import messages from './messages';

const ExtraSmallLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <span
      className="w-100 bg-primary-500 banner__image extra-small-layout"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="company-logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="ml-4.5 mr-1 pb-3.5 pt-3.5">
        <h1 className="banner__heading">
          <span className="text-light-100">
            PT
          </span>
          <span className="text-light-100">
              EdTechLab
          </span>
        </h1>
      </div>
    </span>
  );
};

export default ExtraSmallLayout;
