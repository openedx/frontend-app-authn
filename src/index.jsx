import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';

import MainApp from './MainApp';
import messages from './i18n';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <MainApp />,
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
        USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME || null,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
        WELCOME_PAGE_SUPPORT_LINK: process.env.WELCOME_PAGE_SUPPORT_LINK || null,
        DISABLE_ENTERPRISE_LOGIN: process.env.DISABLE_ENTERPRISE_LOGIN || '',
        INFO_EMAIL: process.env.INFO_EMAIL || '',
        REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME || null,
        ENABLE_PROGRESSIVE_PROFILING: process.env.ENABLE_PROGRESSIVE_PROFILING || false,
        MARKETING_EMAILS_OPT_IN: process.env.MARKETING_EMAILS_OPT_IN || '',
        ENABLE_COPPA_COMPLIANCE: process.env.ENABLE_COPPA_COMPLIANCE || '',
        SHOW_DYNAMIC_PROFILING_PAGE: process.env.SHOW_DYNAMIC_PROFILING_PAGE || false,
      });
    },
  },
  messages: [
    messages,
  ],
});
