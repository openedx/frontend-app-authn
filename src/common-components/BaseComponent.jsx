import React from 'react';
import PropTypes from 'prop-types';

import Responsive from 'react-responsive';

import SmallScreenLayout from './SmallScreenLayout';
import MediumScreenLayout from './MediumScreenLayout';
import LargeScreenLayout from './LargeScreenLayout';

const BaseComponent = ({ children }) => (
  <>
    <Responsive maxWidth={767}>
      <SmallScreenLayout>
        {children}
      </SmallScreenLayout>
    </Responsive>
    <Responsive minWidth={768} maxWidth={1000}>
      <MediumScreenLayout>
        {children}
      </MediumScreenLayout>
    </Responsive>
    <Responsive minWidth={1001}>
      <LargeScreenLayout>
        {children}
      </LargeScreenLayout>
    </Responsive>
  </>
);

BaseComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BaseComponent;
