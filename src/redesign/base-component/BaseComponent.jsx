import React, { useEffect } from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

import { history } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  ExtraSmall, Small, Medium, Large, ExtraLarge, ExtraExtraLarge,
} from '@edx/paragon';

import LargeLayout from './LargeLayout';
import MediumLayout from './MediumLayout';
import SmallLayout from './SmallLayout';

import AuthExtraLargeLayout from './AuthExtraLargeLayout';
import AuthMediumLayout from './AuthMediumLayout';
import AuthSmallLayout from './AuthSmallLayout';

const BaseComponent = ({ children }) => {
  let { search } = history.location;

  if (search && search.indexOf('theme') < 0) {
    search = `${search}&theme=redesign`;
  } else {
    search = '?theme=redesign';
  }

  useEffect(() => {
    history.replace({ search });
  }, []);

  const authenticatedUser = getAuthenticatedUser();

  return (
    <>
      <ExtraLarge>
        <div className="col-md-12 extra-large-screen-top-stripe" />
      </ExtraLarge>
      <ExtraExtraLarge>
        <div className="col-md-12 extra-large-screen-top-stripe" />
      </ExtraExtraLarge>

      <div className={classNames('layout', { authenticated: authenticatedUser })}>
        <ExtraSmall>
          <div className="col-md-12 small-screen-top-stripe" />
          {authenticatedUser ? <AuthSmallLayout variant="xs" username={authenticatedUser.username} /> : <SmallLayout />}
        </ExtraSmall>
        <Small>
          <div className="col-md-12 small-screen-top-stripe" />
          {authenticatedUser ? <AuthSmallLayout username={authenticatedUser.username} /> : <SmallLayout />}
        </Small>
        <Medium>
          <div className="w-100 medium-screen-top-stripe" />
          {authenticatedUser ? <AuthMediumLayout username={authenticatedUser.username} /> : <MediumLayout />}
        </Medium>
        <Large>
          <div className="w-100 large-screen-top-stripe" />
          {authenticatedUser ? <AuthMediumLayout username={authenticatedUser.username} /> : <MediumLayout />}
        </Large>
        <ExtraLarge>
          {authenticatedUser ? <AuthExtraLargeLayout username={authenticatedUser.username} /> : <LargeLayout />}
        </ExtraLarge>
        <ExtraExtraLarge>
          {authenticatedUser ? <AuthExtraLargeLayout variant="xxl" username={authenticatedUser.username} /> : <LargeLayout />}
        </ExtraExtraLarge>

        <div className={classNames('content', { 'align-items-center mt-0': authenticatedUser })}>
          {children}
        </div>
      </div>
    </>
  );
};

BaseComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BaseComponent;
