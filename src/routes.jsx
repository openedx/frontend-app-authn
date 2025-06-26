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
        )
      },
      {
        path: 'login',
        element: (
          <UnAuthOnlyRoute><Logistration selectedPage={LOGIN_PAGE} /></UnAuthOnlyRoute>
        )
      },
      {
        path: 'register',
        element: (
          <UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>
        ),
      },
      {
        path: 'reset',
        element: (
          <UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>
        ),
      },
      {
        path: 'password_reset_confirm/:token',
        element: (
          <ResetPasswordPage />
        ),
      },
      {
        path: 'welcome',
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
