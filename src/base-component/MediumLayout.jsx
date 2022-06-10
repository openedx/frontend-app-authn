import React, { useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Hyperlink, Image, Toast } from '@edx/paragon';
import { faCut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import ClipboardJS from 'clipboard';
import PropTypes from 'prop-types';

import messages from './messages';
import SideDiscountBanner from './SideDiscountBanner';

const MediumLayout = (props) => {
  const { intl, isRegistrationPage, experimentName } = props;
  const [showToast, setToastShow] = useState(false);
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new

  return (
    <div className={classNames(
      'container row p-0 mb-3 medium-screen-container',
      {
        'variation1-medium-screen': experimentName === 'variation1' && isRegistrationPage,
      },
    )}
    >
      <Toast
        onClose={() => setToastShow(false)}
        show={showToast}
      >
        {intl.formatMessage(messages['code.copied'])}
      </Toast>
      <div className="col-md-10 p-0 screen-header-primary">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="row mt-4 justify-content-center">
          <svg className={classNames(
            'medium-screen-svg-line pl-5',
            {
              'variation1-bar-color': experimentName === 'variation1' && isRegistrationPage,
              'variation2-bar-color': experimentName === 'variation2' && isRegistrationPage,
            },
          )}
          >
            <line x1="50" y1="0" x2="10" y2="215" />
          </svg>
          <div className="pb-4">
            <h1 className="medium-heading">
              {intl.formatMessage(messages['start.learning'])}
              <span
                className={((experimentName === 'variation1' || experimentName === 'variation2') && isRegistrationPage) ? 'text-accent-b' : 'text-accent-a'}
              >
                <br />
                {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
              </span>
            </h1>
            {experimentName === 'variation1' && isRegistrationPage ? (
              <div className="text-light-300 pl-3">
                <SideDiscountBanner />
                <span className="dashed-border h5 text-white">
                  <span id="edx-welcome" className="edx-welcome">EDXWELCOME </span>
                  <FontAwesomeIcon
                    className="text-light-700 copyIcon ml-1 hover-discount-icon"
                    icon={faCut}
                    data-clipboard-action="copy"
                    data-clipboard-target="#edx-welcome"
                    onClick={() => setToastShow(true)}
                  />
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <div />
      </div>
      <div className="col-md-2 p-0 screen-polygon">
        <svg width="100%" height="100%" className="medium-screen-svg-primary" preserveAspectRatio="xMaxYMin meet">
          <g transform="skewX(168)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

MediumLayout.propTypes = {
  intl: intlShape.isRequired,
  experimentName: PropTypes.string,
  isRegistrationPage: PropTypes.bool,
};

MediumLayout.defaultProps = {
  experimentName: '',
  isRegistrationPage: false,
};

export default injectIntl(MediumLayout);
