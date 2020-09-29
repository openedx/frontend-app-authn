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
import ForgotPasswordPage from './forgot-password';
import appMessages from './i18n';

import './index.scss';
import './assets/favicon.ico';

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
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegistrationPage} />
          <Route path="/reset" component={ForgotPasswordPage} />
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
