import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const MediumScreenLayout = (props) => {
  const { intl, children } = props;

  return (
    <div>
      <div className="medium-screen-top-header" />
      <div className="medium-screen-background">
        <img alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
        <div className="d-flex mt-5">
          <div className="pl-3">
            <svg className="h-100 w-4 mt-2">
              <path d="M50 -15L3 215" className="svg-path" />
            </svg>
          </div>
          <div className="pl-3 mw-24">
            <h1 className="text-white font-size-78 line-height-78">
              {intl.formatMessage(messages['start.learning'])}
              <span className="text-accent-a"><br />
                {intl.formatMessage(messages['with.edx'])}
              </span>
            </h1>
          </div>
        </div>
      </div>
      <div className="100vh w-100">
        { children }
      </div>
    </div>
  );
};

MediumScreenLayout.propTypes = {
  intl: intlShape.isRequired,
  children: PropTypes.node.isRequired,
};

export default injectIntl(MediumScreenLayout);
