import React from 'react';
import PropTypes from 'prop-types';

import Responsive from 'react-responsive';

import LargeScreenLayout from './LargeScreenLayout';
import MediumScreenHeader from './MediumScreenHeader';
import SmallScreenHeader from './SmallScreenHeader';

const BaseComponent = ({ children }) => (
  <>
    <Responsive maxWidth={767}>
      <div className="col-md-12 small-screen-top-stripe" />
    </Responsive>
    <Responsive minWidth={768} maxWidth={799}>
      <div className="col-md-12 medium-screen-top-stripe" />
    </Responsive>
    <Responsive minWidth={800} maxWidth={1199}>
      <div className="col-md-12 medium-large-screen-top-stripe" />
    </Responsive>
    <Responsive minWidth={1200}>
      <div className="col-md-12 large-screen-top-stripe" />
    </Responsive>
    <div className="layout">
      <Responsive maxWidth={767}>
        <SmallScreenHeader />
      </Responsive>
      <Responsive minWidth={768} maxWidth={1199}>
        <MediumScreenHeader />
      </Responsive>
      <Responsive minWidth={1200}>
        <LargeScreenLayout />
      </Responsive>
      <div className="content">
        {children}
      </div>
    </div>
  </>
);

BaseComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BaseComponent;
