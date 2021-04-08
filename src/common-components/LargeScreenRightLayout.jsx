import React from 'react';
import PropTypes from 'prop-types';

import { Col } from '@edx/paragon';

const LargeScreenRightLayout = (props) => {
  const { children } = props;

  return (
    <Col xs={6} className="vh-100 pt-5">
      { children }
    </Col>
  );
};

LargeScreenRightLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LargeScreenRightLayout;
