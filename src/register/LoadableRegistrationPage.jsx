import React from 'react';
import loadable from '@loadable/component';
import Spinner from '../common-components/Spinner';

const LoadableComponent = loadable(() => import('./RegistrationPage.jsx'), {
  fallback: <Spinner />,
});

const LoadableRegistrationPage = () => <LoadableComponent />;

export default LoadableRegistrationPage;
