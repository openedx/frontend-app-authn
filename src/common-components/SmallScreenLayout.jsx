import React from 'react';
import PropTypes from 'prop-types';

import SmallScreenTopLayout from './SmallScreenTopLayout';

const SmallScreenLayout = (props) => {
  const { children } = props;

  return (
    <div>
      <div className="small-screen-top-header" />
      <SmallScreenTopLayout />
      <div>
        { children }
      </div>
    </div>
  );
};

SmallScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SmallScreenLayout;
