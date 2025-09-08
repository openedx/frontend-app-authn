import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { breakpoints } from '@openedx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import { useLocation } from 'react-router-dom';

import { LOGIN_PAGE } from '../data/constants';
import { DefaultLargeLayout } from './components/default-layout';
import {
  ImageExtraSmallLayout, ImageLargeLayout, ImageMediumLayout, ImageSmallLayout,
} from './components/image-layout';
import { AuthLargeLayout, AuthMediumLayout, AuthSmallLayout } from './components/welcome-page-layout';
import backgroundImage from '../assets/images/auth-background.png';
import { cn } from '../utils/cn';

const BaseContainer = ({ children, showWelcomeBanner, fullName }) => {
  const location = useLocation();
  const currentPage = location.pathname;
  const isLoginPage = currentPage === LOGIN_PAGE;

  const enableImageLayout = getConfig().ENABLE_IMAGE_LAYOUT;

  if (enableImageLayout) {
    return (
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
    );
  }

  return (
    <div
      className="layout tw-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className={cn('tw-flex tw-justify-center !tw-mt-[12%]', isLoginPage ? 'tw-w-[50vw]' : 'tw-w-full')}>
        {children}
      </div>
      {isLoginPage && <DefaultLargeLayout />}
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
