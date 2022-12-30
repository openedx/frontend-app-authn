import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  APP_INIT_ERROR, APP_READY, initialize, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import { messages as paragonMessages } from '@edx/paragon';

import appMessages from './i18n';
import MainApp from './MainApp';

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
        TOS_LINK: process.env.TOS_LINK || null,
        PRIVACY_POLICY: process.env.PRIVACY_POLICY || null,
        USER_SURVEY_COOKIE_NAME: process.env.USER_SURVEY_COOKIE_NAME || null,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
        AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK: process.env.AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK || null,
        DISABLE_ENTERPRISE_LOGIN: process.env.DISABLE_ENTERPRISE_LOGIN || '',
        INFO_EMAIL: process.env.INFO_EMAIL || '',
        REGISTER_CONVERSION_COOKIE_NAME: process.env.REGISTER_CONVERSION_COOKIE_NAME || null,
        ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN: process.env.ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN || false,
        MARKETING_EMAILS_OPT_IN: process.env.MARKETING_EMAILS_OPT_IN || '',
        ENABLE_COPPA_COMPLIANCE: process.env.ENABLE_COPPA_COMPLIANCE || '',
        ENABLE_DYNAMIC_REGISTRATION_FIELDS: process.env.ENABLE_DYNAMIC_REGISTRATION_FIELDS || false,
        SHOW_CONFIGURABLE_EDX_FIELDS: process.env.SHOW_CONFIGURABLE_EDX_FIELDS || false,
        ENABLE_COOKIE_POLICY_BANNER: process.env.ENABLE_COOKIE_POLICY_BANNER || false,
      });
    },
  },
  messages: [
    appMessages,
    paragonMessages,
  ],
});
