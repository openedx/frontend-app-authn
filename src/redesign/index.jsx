import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AppProvider } from '@edx/frontend-platform/react';

import {
  BaseComponent, UnAuthOnlyRoute, registerIcons, NotFoundPage, Logistration,
} from './common-components';
import {
  LOGIN_PAGE, PAGE_NOT_FOUND, REGISTER_PAGE, RESET_PAGE, PASSWORD_RESET_CONFIRM, WELCOME_PAGE,
} from './data/constants';
import configureStore from './data/configureStore';
import { updatePathWithQueryParams } from './data/utils';
import ForgotPasswordPage from './forgot-password';
import ResetPasswordPage from './reset-password';
import WelcomePage from './welcome';
import './index.scss';

registerIcons();

const RedesignApp = () => (
  <AppProvider store={configureStore()}>
    <BaseComponent>
      <Switch>
        <Route exact path="/">
          <Redirect to={updatePathWithQueryParams(REGISTER_PAGE)} />
        </Route>
        <UnAuthOnlyRoute exact path={LOGIN_PAGE} render={() => <Logistration selectedPage={LOGIN_PAGE} />} />
        <UnAuthOnlyRoute exact path={REGISTER_PAGE} component={Logistration} />
        <UnAuthOnlyRoute exact path={RESET_PAGE} component={ForgotPasswordPage} />
        <Route exact path={PASSWORD_RESET_CONFIRM} component={ResetPasswordPage} />
        <Route exact path={WELCOME_PAGE} component={WelcomePage} />
        <Route path={PAGE_NOT_FOUND} component={NotFoundPage} />
        <Route path="*">
          <Redirect to={PAGE_NOT_FOUND} />
        </Route>
      </Switch>
    </BaseComponent>
  </AppProvider>
);

export default RedesignApp;
