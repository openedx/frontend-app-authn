import React from 'react';
import PropTypes from 'prop-types';

import { Row } from '@edx/paragon';

import LargeScreenLeftLayout from './LargeScreenLeftLayout';
import LargeScreenRightLayout from './LargeScreenRightLayout';

const LargeScreenLayout = (props) => {
  const { children } = props;

  return (
    <div>
      <div className="large-screen-top-header" />
      <Row className="large-screen-background">
        <LargeScreenLeftLayout />
        <LargeScreenRightLayout>
          { children }
        </LargeScreenRightLayout>
      </Row>
    </div>
  );
};

LargeScreenLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LargeScreenLayout;
