import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../common-components/Spinner';

const LoadableComponent = loadable(() => import('./ForgotPasswordPage.jsx'), {
  fallback: <Spinner />,
});

const LoadableForgotPasswordPage = () => <LoadableComponent />;

export default LoadableForgotPasswordPage;
