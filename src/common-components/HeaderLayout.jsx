import React from 'react';
import PropTypes from 'prop-types';

import Header from '@edx/frontend-component-header';

const HeaderLayout = ({ children }) => (
  <div className="d-flex flex-column">
    <Header />
    <main className="flex-grow-1">
      {children}
    </main>
  </div>
);

HeaderLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HeaderLayout;
