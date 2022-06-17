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

const SmallLayout = (props) => {
  const { intl, isRegistrationPage, experimentName } = props;
  const [showToast, setToastShow] = useState(false);
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new

  return (
    <>
      <div className="small-screen-header-primary">
        <Toast
          onClose={() => setToastShow(false)}
          show={showToast}
        >
          {intl.formatMessage(messages['code.copied'])}
        </Toast>
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="d-flex mt-3">
          <svg className={classNames(
            'small-screen-svg-line',
            {
              'variation1-bar-color': experimentName === 'variation1' && isRegistrationPage,
              'variation2-bar-color': experimentName === 'variation2' && isRegistrationPage,
            },
          )}
          >
            <line x1="55" y1="0" x2="40" y2="65" />
          </svg>
          <div className="pb-3">
            <h1 className="small-heading">
              {intl.formatMessage(messages['start.learning'])}
              <br />
              <span
                className={((experimentName === 'variation1' || experimentName === 'variation2') && isRegistrationPage) ? 'text-accent-b' : 'text-accent-a'}
              >
                {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
              </span>
            </h1>
            {(experimentName === 'variation1' && isRegistrationPage) ? (
              <div className="small text-light-300 pl-2">
                <SideDiscountBanner />
                <span className="dashed-border h6 text-white d-inline-flex flex-wrap align-items-center">
                  <span id="edx-welcome" className="edx-welcome mr-1">EDXWELCOME</span>
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
      </div>
    </>
  );
};

SmallLayout.propTypes = {
  intl: intlShape.isRequired,
  experimentName: PropTypes.string,
  isRegistrationPage: PropTypes.bool,
};

SmallLayout.defaultProps = {
  experimentName: '',
  isRegistrationPage: false,

};

export default injectIntl(SmallLayout);
