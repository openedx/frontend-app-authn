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
      const module = await import(/* webpackChunkName: "authn-main" */ './Main');
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
          roles: [loginRole],
        },
        element: (
          <UnAuthOnlyRoute><Logistration selectedPage={loginPath} /></UnAuthOnlyRoute>
        ),
      },
      {
        path: registerPath,
        handle: {
          roles: [registerRole],
        },
        element: (
          <UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>
        ),
      },
      {
        path: resetPath,
        handle: {
          roles: [resetPasswordRole],
        },
        element: (
          <UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>
        ),
      },
      {
        path: `${passwordResetConfirmPath}/:token`,
        handle: {
          roles: [confirmPasswordRole],
        },
        element: (
          <ResetPasswordPage />
        ),
      },
      {
        path: welcomePath,
        handle: {
          roles: [welcomeRole],
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
