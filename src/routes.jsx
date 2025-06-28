import { Navigate } from 'react-router';

import { EmbeddedRegistrationRoute, NotFoundPage, UnAuthOnlyRoute } from './common-components';
import { LOGIN_PAGE } from './data/constants';
import { ForgotPasswordPage } from './forgot-password';
import Logistration from './logistration/Logistration';
import { ProgressiveProfiling } from './progressive-profiling';
import { RegistrationPage } from './register';
import { ResetPasswordPage } from './reset-password';

import Main from './Main';

const routes = [
  {
    id: 'org.openedx.frontend.route.authn.main',
    Component: Main,
    children: [
      {
        path: 'register-embedded',
        element: (
          <EmbeddedRegistrationRoute><RegistrationPage /></EmbeddedRegistrationRoute>
        ),
      },
      {
        path: 'login',
        handle: {
          role: 'org.openedx.frontend.role.login',
        },
        element: (
          <UnAuthOnlyRoute><Logistration selectedPage={LOGIN_PAGE} /></UnAuthOnlyRoute>
        ),
      },
      {
        path: 'register',
        handle: {
          role: 'org.openedx.frontend.role.register',
        },
        element: (
          <UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>
        ),
      },
      {
        path: 'reset',
        handle: {
          role: 'org.openedx.frontend.role.resetPassword',
        },
        element: (
          <UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>
        ),
      },
      {
        path: 'password_reset_confirm/:token',
        handle: {
          role: 'org.openedx.frontend.role.confirmPassword',
        },
        element: (
          <ResetPasswordPage />
        ),
      },
      {
        path: 'welcome',
        handle: {
          role: 'org.openedx.frontend.role.welcome',
        },
        element: (
          <ProgressiveProfiling />
        ),
      },
      {
        path: 'notfound',
        element: (
          <NotFoundPage />
        ),
      },
    ]
  }
];

export default routes;
