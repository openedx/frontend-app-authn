import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize, mergeConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

import { messages as headerMessages } from '@edx/frontend-component-header';

import configureStore from './data/configureStore';
import { RegistrationPage } from './register';
import { LoginPage } from './login';
import {
  LOGIN_PAGE, PAGE_NOT_FOUND, REGISTER_PAGE, RESET_PAGE, PASSWORD_RESET_CONFIRM,
} from './data/constants';
import ForgotPasswordPage from './forgot-password';
import {
  BaseComponent, UnAuthOnlyRoute, registerIcons, NotFoundPage,
} from './common-components';
import ResetPasswordPage from './reset-password';
import appMessages from './i18n';

import './index.scss';

registerIcons();

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <BaseComponent>
        <Switch>
          <Route exact path="/">
            <Redirect to={PAGE_NOT_FOUND} />
          </Route>
          <UnAuthOnlyRoute exact path={LOGIN_PAGE} component={LoginPage} />
          <UnAuthOnlyRoute exact path={REGISTER_PAGE} component={RegistrationPage} />
          <UnAuthOnlyRoute exact path={RESET_PAGE} component={ForgotPasswordPage} />
          <Route exact path={PASSWORD_RESET_CONFIRM} component={ResetPasswordPage} />
          <Route path={PAGE_NOT_FOUND} component={NotFoundPage} />
          <Route path="*">
            <Redirect to={PAGE_NOT_FOUND} />
          </Route>
        </Switch>
      </BaseComponent>
    </AppProvider>,
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
        REGISTRATION_OPTIONAL_FIELDS: process.env.REGISTRATION_OPTIONAL_FIELDS || '',
      });
    },
  },
  messages: [
    appMessages,
    headerMessages,
  ],
});
