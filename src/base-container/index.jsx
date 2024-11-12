import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { breakpoints } from '@openedx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import { DefaultLargeLayout, DefaultMediumLayout, DefaultSmallLayout } from './components/default-layout';
import {
  ImageExtraSmallLayout, ImageLargeLayout, ImageMediumLayout, ImageSmallLayout,
} from './components/image-layout';
import { AuthLargeLayout, AuthMediumLayout, AuthSmallLayout } from './components/welcome-page-layout';
import loginBG from './login-bg.jpg';

const BaseContainer = ({ children, showWelcomeBanner, fullName }) => {
  const enableImageLayout = getConfig().ENABLE_IMAGE_LAYOUT;

  if (enableImageLayout) {
    return (
      <div className="layout-container">
        <div className="red-stroke-line" />
        <div className="layout">
          <MediaQuery maxWidth={breakpoints.extraSmall.maxWidth - 1}>
            {showWelcomeBanner ? <AuthSmallLayout fullName={fullName} /> : <ImageExtraSmallLayout />}
          </MediaQuery>
          <MediaQuery minWidth={breakpoints.small.minWidth} maxWidth={breakpoints.small.maxWidth - 1}>
            {showWelcomeBanner ? <AuthSmallLayout fullName={fullName} /> : <ImageSmallLayout />}
          </MediaQuery>
          <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
            {showWelcomeBanner ? <AuthMediumLayout fullName={fullName} /> : <ImageMediumLayout />}
          </MediaQuery>
          <MediaQuery minWidth={breakpoints.extraLarge.minWidth}>
            {showWelcomeBanner ? <AuthLargeLayout fullName={fullName} /> : <ImageLargeLayout />}
          </MediaQuery>
          <div className={classNames('content', { 'align-items-center mt-0': showWelcomeBanner })}>
            {children}
          </div>
        </div>
        <div className="red-stroke-line" />
      </div>
    );
  }

  return (
    <div className="layout-container">
      <div className="red-stroke-line" style={{overflow:"hidden"}} />
      <div className="layout" style={{
          backgroundImage: `url(${loginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <MediaQuery maxWidth={breakpoints.small.maxWidth - 1}>
          {showWelcomeBanner ? <AuthSmallLayout fullName={fullName} /> : <DefaultSmallLayout />}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
          {showWelcomeBanner ? <AuthMediumLayout fullName={fullName} /> : <DefaultMediumLayout />}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.extraLarge.minWidth}>
          {showWelcomeBanner ? <AuthLargeLayout fullName={fullName} /> : <DefaultLargeLayout />}
        </MediaQuery>
        
        
        
        <MediaQuery maxWidth={breakpoints.small.maxWidth - 1}>
        <div style={{
          backgroundColor: "white",
          marginTop: "10px",
          marginBottom: "200px",
          padding: "10px",
          borderRadius: "20px"
        }} className={classNames('content', { 'align-items-center mt-0': showWelcomeBanner })}>
          {children}
        </div>
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.large.maxWidth - 1}>
        <div style={{
          backgroundColor: "white",
          marginTop: "-300px",
          marginBottom: "200px",
          padding: "120px",
          borderRadius: "20px"
        }} className={classNames('content', { 'align-items-center mt-0': showWelcomeBanner })}>
          {children}
        </div>
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.extraLarge.minWidth}>
        <div style={{
          backgroundColor: "white",
          marginTop: "1rem",
          marginBottom: "1rem",
          paddingTop: "2rem",
          borderTopLeftRadius: "20px"
        }} className={classNames('content', { 'align-items-center mt-0': showWelcomeBanner })}>
          {children}
        </div>
        </MediaQuery>
        
      </div>
    </div>
  );
};

BaseContainer.defaultProps = {
  showWelcomeBanner: false,
  fullName: null,
};

BaseContainer.propTypes = {
  children: PropTypes.node.isRequired,
  showWelcomeBanner: PropTypes.bool,
  fullName: PropTypes.string,
};

export default BaseContainer;
