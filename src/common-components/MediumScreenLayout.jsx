import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const MediumScreenLayout = (props) => {
  const { intl, children } = props;

  return (
    <div>
      <div className="h-10 bc-brand-700 d-flex">
        <div className="bc-brand-700 w-10 skew-deg-170" />
        <div className="bc-brand w-80 skew-deg-170" />
        <div className="bc-primary-700 w-10 skew-deg-170" />
      </div>
      <div className="medium-screen-background">
        <img alt="edx" className="pt-20 pl-3 mw-65 h-65" src={getConfig().LOGO_WHITE_URL} />
        <div className="d-flex">
          <div className="pt-3 pl-5">
            <div className="bc-accent-b rotate-deg-11 w-5 h-120 mt-1" />
          </div>
          <div className="pt-3 pl-5 mw-230">
            <h1 className="text-white">
              {intl.formatMessage(messages['start.learning'])}
              <span className="color-accent-a"><br />
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
