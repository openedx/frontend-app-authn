import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { messages as headerMessages } from '@edx/frontend-component-header';

const RedesignApp = React.lazy(() => import('./redesign/index.jsx'));
const LegacyApp = React.lazy(() => import('./legacy/index.jsx'));

const redesignAppMessages = React.lazy(() => import('./redesign/i18n'));
const legacyAppMessages = React.lazy(() => import('./legacy/i18n'));

const OLD_DESIGN = 'legacy';
const NEW_DESIGN = 'redesign';
const DEFAULT_DESIGN = process.env.DEFAULT_DESIGN || OLD_DESIGN;
const CHOSEN_DESIGN = localStorage.getItem('DESIGN_NAME') || DEFAULT_DESIGN;
const REGISTRATION_OPTIONAL_FIELDS = CHOSEN_DESIGN === DEFAULT_DESIGN ? process.env.REGISTRATION_OPTIONAL_FIELDS : '';

const AppSelector = () => (
  <React.Suspense fallback={<></>}>
    {(CHOSEN_DESIGN === OLD_DESIGN) && <LegacyApp />}
    {(CHOSEN_DESIGN === NEW_DESIGN) && <RedesignApp />}
  </React.Suspense>
);

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppSelector />,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        LOGIN_ISSUE_SUPPORT_LINK: process.env.LOGIN_ISSUE_SUPPORT_LINK || null,
        ACTIVATION_EMAIL_SUPPORT_LINK: process.env.ACTIVATION_EMAIL_SUPPORT_LINK || null,
        PASSWORD_RESET_SUPPORT_LINK: process.env.PASSWORD_RESET_SUPPORT_LINK || null,
        TOS_AND_HONOR_CODE: process.env.TOS_AND_HONOR_CODE || null,
        PRIVACY_POLICY: process.env.PRIVACY_POLICY || null,
        REGISTRATION_OPTIONAL_FIELDS,
        USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME || null,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
        WELCOME_PAGE_SUPPORT_LINK: process.env.WELCOME_PAGE_SUPPORT_LINK || null,
        DISABLE_ENTERPRISE_LOGIN: process.env.DISABLE_ENTERPRISE_LOGIN || '',
        INFO_EMAIL: process.env.INFO_EMAIL || '',
        REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME || null,
      });
    },
  },
  messages: [
    CHOSEN_DESIGN === DEFAULT_DESIGN ? legacyAppMessages : redesignAppMessages,
    headerMessages,
  ],
});
