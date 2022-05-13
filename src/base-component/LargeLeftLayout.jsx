import React, { useState } from 'react';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import ClipboardJS from 'clipboard';

import { faCut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Toast } from '@edx/paragon';

import messages from './messages';
import SideDiscountBanner from './SideDiscountBanner';

const LargeLeftLayout = (props) => {
  const { intl, isRegistrationPage, experimentName } = props;
  const [showToast, setToastShow] = useState(false);
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new

  return (
    <div className="min-vh-100 d-flex justify-content-left align-items-center">
      <div className="d-flex pr-0 mt-lg-n2">
        <Toast
          onClose={() => setToastShow(false)}
          show={showToast}
        >
          {intl.formatMessage(messages['code.copied'])}
        </Toast>
        <svg className={classNames(
          'large-screen-svg-line',
          {
            'variation1-bar-color mt-n6 pt-0 ml-5': experimentName === 'variation1' && isRegistrationPage,
            'variation2-bar-color': experimentName === 'variation2' && isRegistrationPage,
            'ml-5': experimentName !== 'variation1' || !isRegistrationPage,
          },
        )}
        >
          <line x1="50" y1="0" x2="10" y2="215" />
        </svg>
        <div className={classNames({ 'pl-4': experimentName === 'variation1' && isRegistrationPage })}>
          <h1 className={classNames('large-heading', { 'mb-4.5': experimentName === 'variation1' && isRegistrationPage })}>
            {intl.formatMessage(messages['start.learning'])}
            <span
              className={((experimentName === 'variation1' || experimentName === 'variation2') && isRegistrationPage) ? 'text-accent-b' : 'text-accent-a'}
            >
              <br />
              {intl.formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
            </span>
          </h1>
          {experimentName === 'variation1' && isRegistrationPage ? (
            <span className="text-light-300 dicount-heading">
              <span className="lead mr-3">
                <SideDiscountBanner />
              </span>
              <span className="dashed-border d-inline-flex flex-wrap align-items-center">
                <span id="edx-welcome" className="text-white edx-welcome font-weight-bold mr-1">EDXWELCOME</span>
                <FontAwesomeIcon
                  className="text-light-700 copyIcon ml-1.5 hover-discount-icon"
                  icon={faCut}
                  data-clipboard-action="copy"
                  data-clipboard-target="#edx-welcome"
                  onClick={() => setToastShow(true)}
                />
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

LargeLeftLayout.propTypes = {
  intl: intlShape.isRequired,
  experimentName: PropTypes.string,
  isRegistrationPage: PropTypes.bool,
};

LargeLeftLayout.defaultProps = {
  experimentName: '',
  isRegistrationPage: false,
};

export default injectIntl(LargeLeftLayout);
