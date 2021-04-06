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
          <img alt="edx" className="pt-3 pl-3 mw-5" src={getConfig().LOGO_WHITE_URL} />
        </div>
        <div className="d-flex float-left w-50">
          <div className="pt-140 pl-3">
            <svg className="h-120 w-4 mt-1">
              <path d="M50 -15L3 200" className="svg-path" fill="none" />
            </svg>
          </div>
          <div className="pt-140 pl-3 mw-15">
            <h1 className="text-white">
              {intl.formatMessage(messages['start.learning'])}
              <span className="color-accent-a"><br />
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
