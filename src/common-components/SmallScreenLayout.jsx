import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const SmallScreenLayout = (props) => {
  const { intl, children } = props;

  return (
    <div>
      <div className="w-100 h-10 d-flex bc-brand-700">
        <div className="bc-brand-700 w-20 skew-deg-170" />
        <div className="bc-brand w-80 skew-deg-170" />
      </div>
      <div className="small-screen-background">
        <img alt="edx" className="pt-20 pl-3 mw-65 h-65" src={getConfig().LOGO_WHITE_URL} />
        <div className="d-flex">
          <div className=" pl-5 pt-20">
            <div className="bc-accent-b rotate-deg-11 w-5 h-72 mt-1" />
          </div>
          <div className="pl-4 pt-20">
            <h1 className="text-white">
              {intl.formatMessage(messages['start.learning'])}
              <br />
              <span className="color-accent-a">
                {intl.formatMessage(messages['with.edx'])}
              </span>
            </h1>
          </div>
        </div>
      </div>
      <div>
        { children }
      </div>
    </div>
  );
};

SmallScreenLayout.propTypes = {
  intl: intlShape.isRequired,
  children: PropTypes.node.isRequired,
};

export default injectIntl(SmallScreenLayout);
