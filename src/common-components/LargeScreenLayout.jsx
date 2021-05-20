import React from 'react';

import { getConfig } from '@edx/frontend-platform';

import LargeScreenLeftLayout from './LargeScreenLeftLayout';

const LargeScreenLayout = () => (
  <>
    <img alt="edx" className="logo position-absolute" src={getConfig().LOGO_WHITE_URL} />
    <div className="large-screen-container">
      {/* <div className="col-md-12 large-screen-top-stripe" /> */}
      <LargeScreenLeftLayout />
    </div>
  </>
);

export default LargeScreenLayout;
