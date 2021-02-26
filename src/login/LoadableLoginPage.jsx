import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../common-components/Spinner';

const LoadableComponent = loadable(() => import('./LoginPage.jsx'), {
  fallback: <Spinner />,
});

const LoadableLoginPage = () => <LoadableComponent />;

export default LoadableLoginPage;
