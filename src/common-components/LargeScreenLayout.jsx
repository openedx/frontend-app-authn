import React from 'react';

import { getConfig } from '@edx/frontend-platform';

import LargeScreenLeftLayout from './LargeScreenLeftLayout';

const LargeScreenLayout = () => (
  <div className="container row p-0 m-0 large-screen-container">
    <div className="col-md-8 p-0 screen-header">
      <img alt="edx" className="logo position-absolute" src={getConfig().LOGO_WHITE_URL} />
      <LargeScreenLeftLayout />
    </div>
    <div className="col-md-4 p-0 screen-polygon">
      <svg width="100%" height="100%" className="large-screen-svg" preserveAspectRatio="xMaxYMin meet">
        <g transform="skewX(168)">
          <rect x="0" y="0" height="100%" width="100%" />
        </g>
      </svg>
    </div>
  </div>
);

export default LargeScreenLayout;
