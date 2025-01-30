import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image } from '@openedx/paragon';

import './index.scss';
import backgroundImage from './background.png'
import messages from './messages';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div
      className="w-50 bg-primary-500 banner__image large-layout"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="company-logo position-absolute" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="min-vh-100 p-5 d-flex align-items-end">
        <h1 className="display-2 mw-sm mb-3 d-flex flex-column flex-shrink-0 justify-content-center">
          <span className="text-dark-900">
            PT
          </span>
          <span className="text-danger-500">
              EdTechLab
          </span>
        </h1>
      </div>
    </div>
  );
};

export default LargeLayout;
