import React from 'react';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@edx/paragon';

import PropTypes from 'prop-types';

import ClipboardJS from 'clipboard';

import { faCut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import messages from './messages';

const SmallLayout = (props) => {
  const { intl, isRegistrationPage, experimentName } = props;
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new
  return (
    <>
      <div className="small-screen-header-primary">
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
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
                <span className="mr-1.5">Get <span className="text-accent-a h3">15% off</span> your first verified <br />certificate* with code</span>
                <span className="dashed-border h6 text-white d-inline-flex flex-wrap align-items-center">
                  <span id="edx-welcome" className="edx-welcome mr-1">EDXWELCOME</span>
                  <FontAwesomeIcon
                    className="text-light-700 copyIcon ml-1"
                    icon={faCut}
                    data-clipboard-action="copy"
                    data-clipboard-target="#edx-welcome"
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
