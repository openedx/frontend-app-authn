import React, { useState } from 'react';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { breakpoints } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import { DefaultLargeLayout, DefaultMediumLayout, DefaultSmallLayout } from './components/default-layout';
import {
  ImageExtraSmallLayout, ImageLargeLayout, ImageMediumLayout, ImageSmallLayout,
} from './components/image-layout';
import { AuthLargeLayout, AuthMediumLayout, AuthSmallLayout } from './components/welcome-page-layout';
import DEFAULT_LAYOUT from './data/constants';

const BaseContainer = ({ children, showWelcomeBanner }) => {
  const authenticatedUser = showWelcomeBanner ? getAuthenticatedUser() : null;
  const username = authenticatedUser ? authenticatedUser.username : null;
  // eslint-disable-next-line no-unused-vars
  const [baseContainerVersion, setBaseContainerVersion] = useState(DEFAULT_LAYOUT);

  if (baseContainerVersion === DEFAULT_LAYOUT) {
    return (
      <>
        <div className="col-md-12 extra-large-screen-top-stripe" />
        <div className="layout">
          <MediaQuery maxWidth={breakpoints.small.maxWidth - 1}>
            {authenticatedUser ? <AuthSmallLayout username={username} /> : <DefaultSmallLayout />}
          </MediaQuery>
          <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
            {authenticatedUser ? <AuthMediumLayout username={username} /> : <DefaultMediumLayout />}
          </MediaQuery>
          <MediaQuery minWidth={breakpoints.extraLarge.minWidth}>
            {authenticatedUser ? <AuthLargeLayout username={username} /> : <DefaultLargeLayout />}
          </MediaQuery>
          <div className={classNames('content', { 'align-items-center mt-0': authenticatedUser })}>
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="layout">
      <MediaQuery maxWidth={breakpoints.extraSmall.maxWidth - 1}>
        {authenticatedUser ? <AuthSmallLayout username={username} /> : <ImageExtraSmallLayout />}
      </MediaQuery>
      <MediaQuery minWidth={breakpoints.small.minWidth} maxWidth={breakpoints.small.maxWidth - 1}>
        {authenticatedUser ? <AuthSmallLayout username={username} /> : <ImageSmallLayout />}
      </MediaQuery>
      <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
        {authenticatedUser ? <AuthMediumLayout username={username} /> : <ImageMediumLayout />}
      </MediaQuery>
      <MediaQuery minWidth={breakpoints.extraLarge.minWidth}>
        {authenticatedUser ? <AuthLargeLayout username={username} /> : <ImageLargeLayout />}
      </MediaQuery>
      <div className={classNames('content', { 'align-items-center mt-0': authenticatedUser })}>
        {children}
      </div>
    </div>
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
