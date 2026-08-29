import { getSiteConfig, useIntl } from '@openedx/frontend-base';
import classNames from 'classnames';

import BrandLogo from '../BrandLogo';
import messages from './messages';

const MediumLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className="w-100 medium-screen-top-stripe" />
      <div className="w-100 p-0 mb-3 d-flex">
        <div className="col-md-10 bg-primary-400">
          <BrandLogo className="logo" />
          <div className="d-flex align-items-center justify-content-center mb-4 ">
            <div className={classNames({ 'mt-1 medium-yellow-line': getSiteConfig().siteName === 'edX' })} />
            <div>
              <h1
                className={classNames(
                  'display-1 text-white mt-5 mb-5 mr-2 main-heading',
                  { 'ml-4.5': getSiteConfig().siteName !== 'edX' },
                )}
              >
                <span>
                  {formatMessage(messages['start.learning'])}{' '}
                  <span className="text-accent-a d-inline-block">
                    {formatMessage(messages['with.site.name'], { siteName: getSiteConfig().siteName })}
                  </span>
                </span>
              </h1>
            </div>
          </div>
        </div>
        <div className="col-md-2 bg-white p-0">
          <svg className="w-100 h-100 medium-screen-svg-primary" preserveAspectRatio="xMaxYMin meet">
            <g transform="skewX(168)">
              <rect x="0" y="0" height="100%" width="100%" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
};

export default MediumLayout;
