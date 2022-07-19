import React from 'react';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getLocale } from '@edx/frontend-platform/i18n';
import { breakpoints } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import AuthExtraLargeLayout from './AuthExtraLargeLayout';
import AuthMediumLayout from './AuthMediumLayout';
import AuthSmallLayout from './AuthSmallLayout';
import LargeLayout from './LargeLayout';
import MediumLayout from './MediumLayout';
import SmallLayout from './SmallLayout';

const BaseComponent = ({ children, showWelcomeBanner }) => {
  const authenticatedUser = showWelcomeBanner ? getAuthenticatedUser() : null;

  return (
    <>
      <CookiePolicyBanner languageCode={getLocale()} />
      <MediaQuery minWidth={breakpoints.extraLarge.minWidth} maxWidth={breakpoints.extraLarge.maxWidth}>
        <div className="col-md-12 extra-large-screen-top-stripe" />
      </MediaQuery>
      <MediaQuery minWidth={breakpoints.extraExtraLarge.minWidth} maxWidth={breakpoints.extraExtraLarge.maxWidth}>
        <div className="col-md-12 extra-large-screen-top-stripe" />
      </MediaQuery>

      <div className={classNames('layout', { authenticated: authenticatedUser })}>
        <MediaQuery maxWidth={breakpoints.extraSmall.maxWidth}>
          <div className="col-md-12 small-screen-top-stripe" />
          {authenticatedUser ? <AuthSmallLayout variant="xs" username={authenticatedUser.username} /> : (
            <SmallLayout />
          )}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.small.minWidth} maxWidth={breakpoints.small.maxWidth}>
          <div className="col-md-12 small-screen-top-stripe" />
          {authenticatedUser ? <AuthSmallLayout username={authenticatedUser.username} /> : (
            <SmallLayout />
          )}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.medium.minWidth} maxWidth={breakpoints.medium.maxWidth}>
          <div className="w-100 medium-screen-top-stripe" />
          {authenticatedUser ? <AuthMediumLayout username={authenticatedUser.username} /> : (
            <MediumLayout />
          )}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.large.minWidth} maxWidth={breakpoints.large.maxWidth}>
          <div className="w-100 large-screen-top-stripe" />
          {authenticatedUser ? <AuthMediumLayout username={authenticatedUser.username} /> : (
            <MediumLayout />
          )}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.extraLarge.minWidth} maxWidth={breakpoints.extraLarge.maxWidth}>
          {authenticatedUser ? <AuthExtraLargeLayout username={authenticatedUser.username} /> : (
            <LargeLayout />
          )}
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.extraExtraLarge.minWidth} maxWidth={breakpoints.extraExtraLarge.maxWidth}>
          {authenticatedUser ? <AuthExtraLargeLayout variant="xxl" username={authenticatedUser.username} /> : (
            <LargeLayout />
          )}
        </MediaQuery>

        <div className={classNames('content', { 'align-items-center mt-0': authenticatedUser })}>
          {children}
        </div>
      </div>
    </>
  );
};

BaseComponent.defaultProps = {
  showWelcomeBanner: false,
};

BaseComponent.propTypes = {
  children: PropTypes.node.isRequired,
  showWelcomeBanner: PropTypes.bool,
};

export default BaseComponent;
