import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@edx/paragon';

import LargeScreenLeftLayout from './LargeLeftLayout';

const LargeLayout = ({ experimentName, isRegistrationPage }) => (
  <div className="container row p-0 m-0 large-screen-container">
    <div className="col-md-9 p-0 screen-header-primary">
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image alt="edx" className="logo position-absolute" src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <LargeScreenLeftLayout experimentName={experimentName} isRegistrationPage={isRegistrationPage} />
    </div>
    <div className="col-md-3 p-0 screen-polygon">
      <svg
        width="100%"
        height="100%"
        className="ml-n1 large-screen-svg-primary"
        preserveAspectRatio="xMaxYMin meet"
      >
        <g transform="skewX(171.6)">
          <rect x="0" y="0" height="100%" width="100%" />
        </g>
      </svg>
    </div>
  </div>
);

LargeLayout.defaultProps = {
  experimentName: '',
  isRegistrationPage: false,
};

LargeLayout.propTypes = {
  experimentName: PropTypes.string,
  isRegistrationPage: PropTypes.bool,
};

export default LargeLayout;
