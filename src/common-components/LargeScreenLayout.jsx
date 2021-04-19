import React from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { Row } from '@edx/paragon';

import LargeScreenLeftLayout from './LargeScreenLeftLayout';
import LargeScreenRightLayout from './LargeScreenRightLayout';

const LargeScreenLayout = (props) => {
  const { children } = props;

  return (
    <>
      <img alt="edx" className="logo position-absolute" src={getConfig().LOGO_WHITE_URL} />
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
