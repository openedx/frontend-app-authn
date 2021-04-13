import React from 'react';
import PropTypes from 'prop-types';

import SmallScreenHeader from './SmallScreenHeader';

const SmallScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <SmallScreenHeader />
      { children }
    </>
  );
};

SmallScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SmallScreenLayout;
