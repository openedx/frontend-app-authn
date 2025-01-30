import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';

import './index.scss';
import backgroundImage from './background.png'
import messages from './messages';

const MediumLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div
      className="w-100 mb-3 bg-primary-500 banner__image medium-layout"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="company-logo" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="ml-5 pb-4 pt-4">
        <h1 className="display-2 banner__heading">
          <span className="text-light-100">
            PT
          </span>
          <span className="text-light-100 d-inline-block">
              EdTechLab
          </span>
        </h1>
      </div>
    </div>
  );
};

export default MediumLayout;
