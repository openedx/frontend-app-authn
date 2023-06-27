import React from 'react';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { breakpoints } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import LargeLayout from './components/default-layout/LargeLayout';
import MediumLayout from './components/default-layout/MediumLayout';
import SmallLayout from './components/default-layout/SmallLayout';
import AuthLargeLayout from './components/welcome-page-layout/AuthLargeLayout';
import AuthMediumLayout from './components/welcome-page-layout/AuthMediumLayout';
import AuthSmallLayout from './components/welcome-page-layout/AuthSmallLayout';

const BaseContainer = ({ children, showWelcomeBanner }) => {
  const authenticatedUser = showWelcomeBanner ? getAuthenticatedUser() : null;
  const username = authenticatedUser ? authenticatedUser.username : null;

  return (
    <>
      <div className="col-md-12 extra-large-screen-top-stripe" />
      <div className="layout">
        <MediaQuery maxWidth={breakpoints.small.maxWidth - 1}>
          {authenticatedUser ? <AuthSmallLayout username={username} /> : <SmallLayout />}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
          {authenticatedUser ? <AuthMediumLayout username={username} /> : <MediumLayout />}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.extraLarge.minWidth} maxWidth={breakpoints.extraExtraLarge.maxWidth}>
          {authenticatedUser ? <AuthLargeLayout username={username} /> : <LargeLayout />}
        </MediaQuery>

        <div className={classNames('content', { 'align-items-center mt-0': authenticatedUser })}>
          {children}
        </div>
      </div>
    </>
  );
};

BaseContainer.defaultProps = {
  showWelcomeBanner: false,
};

BaseContainer.propTypes = {
  children: PropTypes.node.isRequired,
  showWelcomeBanner: PropTypes.bool,
};

export default BaseContainer;
