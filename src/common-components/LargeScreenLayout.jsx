import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const LargeScreenLayout = (props) => {
  const { intl, children } = props;

  return (
    <div>
      <div className="large-screen-top-header" />
      <div className="large-screen-background">
        <div>
          <img alt="edx" className="logo" src={getConfig().LOGO_WHITE_URL} />
        </div>
        <div className="d-flex float-left w-50 mt-7">
          <div className="pl-3">
            <svg className="h-100 w-4 mt-2">
              <path d="M50 -15L10 215" className="svg-path" />
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
        <div className="float-right w-50">
          { children }
        </div>
      </div>
    </div>
  );
};

LargeScreenLayout.propTypes = {
  intl: intlShape.isRequired,
  children: PropTypes.node.isRequired,
};

export default injectIntl(LargeScreenLayout);
