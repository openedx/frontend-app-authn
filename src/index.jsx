import 'babel-polyfill';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

import { messages as headerMessages } from '@edx/frontend-component-header';

import configureStore from './data/configureStore';
import { LoginPage, RegistrationPage, NotFoundPage } from './logistration';
import { LOGIN_PAGE, REGISTER_PAGE, RESET_PAGE } from './data/constants';
import ForgotPasswordPage from './forgot-password';
import { HeaderLayout, LoggedInRedirect, registerIcons } from './common-components';
import ResetPasswordPage from './reset-password';
import appMessages from './i18n';

import './index.scss';

registerIcons();

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <LoggedInRedirect>
        <HeaderLayout>
          <Switch>
            <Route exact path="/">
              <Redirect to={LOGIN_PAGE} />
            </Route>
            <Route exact path={LOGIN_PAGE} component={LoginPage} />
            <Route exact path={REGISTER_PAGE} component={RegistrationPage} />
            <Route exact path={RESET_PAGE} component={ForgotPasswordPage} />
            <Route exact path="/password_reset_confirm/:token/" component={ResetPasswordPage} />
            <Route path="/notfound" component={NotFoundPage} />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </HeaderLayout>
      </LoggedInRedirect>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [
    appMessages,
    headerMessages,
  ],
});
