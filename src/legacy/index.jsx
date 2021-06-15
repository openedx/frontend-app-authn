import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AppProvider } from '@edx/frontend-platform/react';

import configureStore from './data/configureStore';
import { RegistrationPage } from './register';
import { LoginPage } from './login';
import {
  LOGIN_PAGE, PAGE_NOT_FOUND, REGISTER_PAGE, RESET_PAGE, PASSWORD_RESET_CONFIRM, WELCOME_PAGE,
} from './data/constants';
import ForgotPasswordPage from './forgot-password';
import {
  HeaderLayout, UnAuthOnlyRoute, registerIcons, NotFoundPage,
} from './common-components';
import ResetPasswordPage from './reset-password';
import WelcomePage from './welcome';
import './index.scss';

registerIcons();

const LegacyApp = () => (
  <AppProvider store={configureStore()}>
    <HeaderLayout>
      <Switch>
        <Route exact path="/">
          <Redirect to={PAGE_NOT_FOUND} />
        </Route>
        <UnAuthOnlyRoute exact path={LOGIN_PAGE} component={LoginPage} />
        <UnAuthOnlyRoute exact path={REGISTER_PAGE} component={RegistrationPage} />
        <UnAuthOnlyRoute exact path={RESET_PAGE} component={ForgotPasswordPage} />
        <Route exact path={PASSWORD_RESET_CONFIRM} component={ResetPasswordPage} />
        <Route exact path={WELCOME_PAGE} component={WelcomePage} />
        <Route path={PAGE_NOT_FOUND} component={NotFoundPage} />
        <Route path="*">
          <Redirect to={PAGE_NOT_FOUND} />
        </Route>
      </Switch>
    </HeaderLayout>
  </AppProvider>
);

export default LegacyApp;
