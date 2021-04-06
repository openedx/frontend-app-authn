import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const LargeScreenLayout = (props) => {
  const { intl, children } = props;

  return (
    <div>
      <div className="h-10 d-flex">
        <div className="bc-brand-700 w-10 skew-deg-170" />
        <div className="bc-brand w-35 skew-deg-170" />
        <div className="bc-primary-700 w-10 skew-deg-170" />
        <div className="bc-accent-a w-20 skew-deg-170" />
        <div className="bc-accent-a-light w-25 skew-deg-170" />
      </div>
      <div className="large-screen-background">
        <div>
          <img alt="edx" className="pt-20 pl-3 mw-65 h-65" src={getConfig().LOGO_WHITE_URL} />
        </div>
        <div className="d-flex float-left w-50">
          <div className="pt-100 pl-50">
            <div className="bc-accent-b rotate-deg-11 w-5 h-124" />
          </div>
          <div className="mw-250 pt-100 pl-50">
            <h1 className="text-white mb-0">{intl.formatMessage(messages['start.learning'])}</h1>
            <h1 className="color-accent-a">{intl.formatMessage(messages['with.edx'])}</h1>
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
