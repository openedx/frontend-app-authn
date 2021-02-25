import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../common-components/Spinner';

const LoadableComponent = loadable(() => import('./ResetPasswordPage.jsx'), {
  fallback: <Spinner />,
});

const LoadableResetPasswordPage = () => <LoadableComponent />;

export default LoadableResetPasswordPage;
