import React from 'react';

import CookiePolicyBanner from '@edx/frontend-component-cookie-policy-banner';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getLocale } from '@edx/frontend-platform/i18n';
import { breakpoints } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import AuthLargeLayout from './AuthLargeLayout';
import AuthMediumLayout from './AuthMediumLayout';
import AuthSmallLayout from './AuthSmallLayout';
import LargeLayout from './LargeLayout';
import MediumLayout from './MediumLayout';
import SmallLayout from './SmallLayout';

const BaseComponent = ({ children, showWelcomeBanner }) => {
  const authenticatedUser = showWelcomeBanner ? getAuthenticatedUser() : null;
  const username = authenticatedUser ? authenticatedUser.username : null;

  return (
    <>
      {getConfig().ENABLE_COOKIE_POLICY_BANNER ? <CookiePolicyBanner languageCode={getLocale()} /> : null}
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

BaseComponent.defaultProps = {
  showWelcomeBanner: false,
};

BaseComponent.propTypes = {
  children: PropTypes.node.isRequired,
  showWelcomeBanner: PropTypes.bool,
};

export default BaseComponent;
