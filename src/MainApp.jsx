import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { Helmet } from 'react-helmet';
import { Navigate, Route, Routes } from 'react-router-dom';

import {
  NotFoundPage, registerIcons, UnAuthOnlyRoute, Zendesk,
} from './common-components';
import configureStore from './data/configureStore';
import {
  AUTHN_PROGRESSIVE_PROFILING,
  LOGIN_PAGE,
  PAGE_NOT_FOUND,
  PASSWORD_RESET_CONFIRM,
  RECOMMENDATIONS,
  RESET_PAGE,
} from './data/constants';
import { ForgotPasswordPage } from './forgot-password';
import Logistration from './logistration/Logistration';
import { ProgressiveProfiling } from './progressive-profiling';
import { RecommendationsPage } from './recommendations';
import { ResetPasswordPage } from './reset-password';

import './index.scss';

registerIcons();

const MainApp = () => (
  <AppProvider store={configureStore()}>
    <Helmet>
      <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
    </Helmet>
    {getConfig().ZENDESK_KEY && <Zendesk />}
    <Routes>
      
      <Route
        path={LOGIN_PAGE}
        element={
          <UnAuthOnlyRoute><Logistration selectedPage={LOGIN_PAGE} /></UnAuthOnlyRoute>
        }
      />
      <Route path={RESET_PAGE} element={<UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>} />
      <Route path={PASSWORD_RESET_CONFIRM} element={<ResetPasswordPage />} />
      <Route path={AUTHN_PROGRESSIVE_PROFILING} element={<ProgressiveProfiling />} />
      <Route path={RECOMMENDATIONS} element={<RecommendationsPage />} />
      <Route path={PAGE_NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate replace to={PAGE_NOT_FOUND} />} />
    </Routes>
  </AppProvider>
);

export default MainApp;
