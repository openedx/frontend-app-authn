import React from 'react';
import PropTypes from 'prop-types';

import MediumScreenHeader from './MediumScreenHeader';

const MediumScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <MediumScreenHeader />
      { children }
    </>
  );
};

MediumScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MediumScreenLayout;
