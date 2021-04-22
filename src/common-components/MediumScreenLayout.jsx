import React from 'react';
import PropTypes from 'prop-types';

import MediumScreenHeader from './MediumScreenHeader';

const MediumScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <MediumScreenHeader />
      <div className="d-flex align-items-center justify-content-center">
        <div className="mt-5">{ children }</div>
      </div>
    </>
  );
};

MediumScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MediumScreenLayout;
