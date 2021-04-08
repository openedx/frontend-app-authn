import React from 'react';
import PropTypes from 'prop-types';

import MediumScreenTopLayout from './MediumScreenTopLayout';

const MediumScreenLayout = (props) => {
  const { children } = props;

  return (
    <div>
      <div className="medium-screen-top-header" />
      <MediumScreenTopLayout />
      <div>
        { children }
      </div>
    </div>
  );
};

MediumScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MediumScreenLayout;
