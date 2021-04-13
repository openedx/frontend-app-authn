import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@edx/paragon';

import LargeScreenLeftLayout from './LargeScreenLeftLayout';
import LargeScreenRightLayout from './LargeScreenRightLayout';

const LargeScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <div className="large-screen-top-stripe" />
      <Row className="large-screen-container">
        <LargeScreenLeftLayout />
        <LargeScreenRightLayout>
          { children }
        </LargeScreenRightLayout>
      </Row>
    </>
  );
};

LargeScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LargeScreenLayout;
