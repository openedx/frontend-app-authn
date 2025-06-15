import { useAppConfig, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Hyperlink, Image } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <div className="w-50 d-flex">
      <div className="col-md-9 bg-primary-400">
        <Hyperlink destination={useAppConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo position-absolute" alt={getSiteConfig().siteName} src={useAppConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="min-vh-100 d-flex align-items-center">
          <div className={classNames({ 'large-yellow-line mr-n4.5': getSiteConfig().siteName === 'edX' })} />
          <h1
            className={classNames(
              'display-2 text-white mw-xs',
              { 'ml-6': getSiteConfig().siteName !== 'edX' },
            )}
          >
            {formatMessage(messages['start.learning'])}
            <div className="text-accent-a">
              {formatMessage(messages['with.site.name'], { siteName: getSiteConfig().siteName })}
            </div>
          </h1>
        </div>
      </div>
      <div className="col-md-3 bg-white p-0">
        <svg className="ml-n1 w-100 h-100 large-screen-svg-primary" preserveAspectRatio="xMaxYMin meet">
          <g transform="skewX(171.6)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LargeLayout;
