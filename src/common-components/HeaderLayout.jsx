import React from 'react';
import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import PropTypes from 'prop-types';
import { getLocale } from '@edx/frontend-platform/i18n';

import Header from '@edx/frontend-component-header';

const HeaderLayout = ({ children }) => (
  <div className="d-flex flex-column">
    <CookiePolicyBanner languageCode={getLocale()} />
    <Header />
    <main className="flex-grow-1" id="main">
      {children}
    </main>
  </div>
);

HeaderLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HeaderLayout;
