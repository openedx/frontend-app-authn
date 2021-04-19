import React from 'react';
import PropTypes from 'prop-types';

import SmallScreenHeader from './SmallScreenHeader';

const SmallScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <SmallScreenHeader />
      <div className="d-flex align-items-center justify-content-center">
        { children }
      </div>
    </>
  );
};

SmallScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SmallScreenLayout;
