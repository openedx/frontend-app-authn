import 'babel-polyfill';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import configureStore from './data/configureStore';
import { LoginPage, RegistrationPage, NotFoundPage } from './logistration';
import { LOGIN_PAGE, REGISTER_PAGE, RESET_PAGE } from './data/constants';
import ForgotPasswordPage from './forgot-password';
import registerIcons from './RegisterFaIcons';
import ResetPasswordPage from './reset-password';
import appMessages from './i18n';

import './index.scss';
import './assets/favicon.ico';

registerIcons();

const HeaderFooterLayout = ({ children }) => ( // eslint-disable-line react/prop-types
  <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
    <Header />
    <main className="flex-grow-1">
      {children}
    </main>
    <Footer />
  </div>
);

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <HeaderFooterLayout>
        <Switch>
          <Route path={LOGIN_PAGE} component={LoginPage} />
          <Route path={REGISTER_PAGE} component={RegistrationPage} />
          <Route path={RESET_PAGE} component={ForgotPasswordPage} />
          <Route path="/password_reset_confirm/:token/" component={ResetPasswordPage} />
          <Route path="/notfound" component={NotFoundPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </HeaderFooterLayout>
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
    footerMessages,
  ],
});
