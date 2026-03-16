import { EmbeddedRegistrationRoute, NotFoundPage, UnAuthOnlyRoute } from './common-components';
import {
  confirmPasswordRole, loginPath, loginRole, notFoundPath,
  passwordResetConfirmPath, registerEmbeddedPath, registerPath, registerRole,
  resetPath, resetPasswordRole, welcomePath, welcomeRole,
} from './constants';
import { ForgotPasswordPage } from './forgot-password';
import Logistration from './logistration/Logistration';
import { ProgressiveProfiling } from './progressive-profiling';
import { RegistrationPage } from './register';
import { ResetPasswordPage } from './reset-password';

const routes = [
  {
    id: 'org.openedx.frontend.route.authn.main',
    path: '/authn',
    async lazy() {
      const module = await import('./Main');
      return { Component: module.default };
    },
    children: [
      {
        path: registerEmbeddedPath,
        element: (
          <EmbeddedRegistrationRoute><RegistrationPage /></EmbeddedRegistrationRoute>
        ),
      },
      {
        path: loginPath,
        handle: {
          role: loginRole,
        },
        element: (
          <UnAuthOnlyRoute><Logistration selectedPage={loginPath} /></UnAuthOnlyRoute>
        ),
      },
      {
        path: registerPath,
        handle: {
          role: registerRole,
        },
        element: (
          <UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>
        ),
      },
      {
        path: resetPath,
        handle: {
          role: resetPasswordRole,
        },
        element: (
          <UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>
        ),
      },
      {
        path: `${passwordResetConfirmPath}/:token`,
        handle: {
          role: confirmPasswordRole,
        },
        element: (
          <ResetPasswordPage />
        ),
      },
      {
        path: welcomePath,
        handle: {
          role: welcomeRole,
        },
        element: (
          <ProgressiveProfiling />
        ),
      },
      {
        path: notFoundPath,
        element: (
          <NotFoundPage />
        ),
      },
    ]
  }
];

export default routes;
