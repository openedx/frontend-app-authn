import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { Helmet } from 'react-helmet';
import { Navigate, Route, Routes } from 'react-router-dom';

import {
  EmbeddedRegistrationRoute, NotFoundPage, registerIcons, UnAuthOnlyRoute,
} from './common-components';
import configureStore from './data/configureStore';
import {
  AUTHN_PROGRESSIVE_PROFILING,
  LOGIN_PAGE,
  PAGE_NOT_FOUND,
  PASSWORD_RESET_CONFIRM,
  RECOMMENDATIONS,
  REGISTER_EMBEDDED_PAGE,
  REGISTER_PAGE,
  RESET_PAGE,
} from './data/constants';
import { updatePathWithQueryParams } from './data/utils';
import { ForgotPasswordPage } from './forgot-password';
import Logistration from './logistration/Logistration';
import MainAppSlot from './plugin-slots/MainAppSlot';
import { ProgressiveProfiling } from './progressive-profiling';
import { RecommendationsPage } from './recommendations';
import { RegistrationPage } from './register';
import { ResetPasswordPage } from './reset-password';

import './index.scss';

registerIcons();

const MainApp = () => (
  <AppProvider store={configureStore()}>
    <Helmet>
      {/* Cohesion Snippet */}
      <script>
        {`!function (co, h, e, s, i, o, n) {
        var d = 'documentElement'; var a = 'className'; h[d][a] += ' preampjs fusejs';
        n.k = e; co._Cohesion = n; co._Preamp = { k: s, start: new Date }; co._Fuse = { k: i }; co._Tagular = { k: o };
        [e, s, i, o].map(function (x) { co[x] = co[x] || function () { (co[x].q = co[x].q || []).push([].slice.call(arguments)) } });
        var b = function () { var u = h[d][a]; h[d][a] = u.replace(/ ?preampjs| ?fusejs/g, '') };
        h.addEventListener('DOMContentLoaded', function () {
            co.setTimeout(b, 3e3);
            co._Preamp.docReady = co._Fuse.docReady = !0
        }); var z = h.createElement('script');
        z.async = 1; z.src = 'https://beam.edx.org/cohesion/cohesion-latest.min.js';
        z.onerror = function () { var ce = 'error',f = 'function'; for (var o of co[e].q || []) o[0] === ce && typeof o[1] == f && o[1](); co[e] = function (n, cb) { n === ce && typeof cb == f && cb() }; b() };
        h.head.appendChild(z);
      }
      (window, document, 'cohesion', 'preamp', 'fuse', 'tagular', {
        tagular: {
          apiHost: 'https://beam.edx.org/v2/t',
          writeKey: "${process.env.COHESION_WRITE_KEY}",
          sourceKey: "${process.env.COHESION_SOURCE_KEY}",
          cookieDomain: 'edx.org',
          domainWhitelist: ["edx.org"],
          apiVersion: 'v2/t',
          multiparty: true,
          useBeacon: true,
        },
        consent: {
          onetrust: {
              enabled: true,
              optIn: true
          },
          required: true,
          domain: '.edx.org',
        },
      });`}
      </script>

      {/* Stitch Cohesion and Segment IDs */}
      <script>
        {`cohesion("tagular:ready", function () {
            window.analytics.ready(function () {
              const cohesionAnonymId = window.tagular("getAliasSet")["anonymousId"];
              const segmentAnonymId = window.analytics.user().anonymousId();
              const segmentUserId = window.analytics.user().id();
              window.analytics.identify(segmentUserId, {
                cohesion_anonymous_id: cohesionAnonymId,
              });
              window.tagular("beam", {
                "@type": "core.Identify.v1",
                traits: {},
                externalIds: [
                  {
                    id: segmentAnonymId,
                    type: "segment_anonymous_id",
                    collection: "users",
                    encoding: "none",
                  },
                  {
                    id: cohesionAnonymId,
                    type: "cohesion_anonymous_id",
                    collection: "users",
                    encoding: "none",
                  },
                ],
              });
            });
          });`}
      </script>
      <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
    </Helmet>
    <Routes>
      <Route path="/" element={<Navigate replace to={updatePathWithQueryParams(REGISTER_PAGE)} />} />
      <Route
        path={REGISTER_EMBEDDED_PAGE}
        element={<EmbeddedRegistrationRoute><RegistrationPage /></EmbeddedRegistrationRoute>}
      />
      <Route
        path={LOGIN_PAGE}
        element={
          <UnAuthOnlyRoute><Logistration selectedPage={LOGIN_PAGE} /></UnAuthOnlyRoute>
        }
      />
      <Route path={REGISTER_PAGE} element={<UnAuthOnlyRoute><Logistration /></UnAuthOnlyRoute>} />
      <Route path={RESET_PAGE} element={<UnAuthOnlyRoute><ForgotPasswordPage /></UnAuthOnlyRoute>} />
      <Route path={PASSWORD_RESET_CONFIRM} element={<ResetPasswordPage />} />
      <Route path={AUTHN_PROGRESSIVE_PROFILING} element={<ProgressiveProfiling />} />
      <Route path={RECOMMENDATIONS} element={<RecommendationsPage />} />
      <Route path={PAGE_NOT_FOUND} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate replace to={PAGE_NOT_FOUND} />} />
    </Routes>
    <MainAppSlot />
  </AppProvider>
);

export default MainApp;
