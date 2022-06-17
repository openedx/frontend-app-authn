import React from 'react';

import * as auth from '@edx/frontend-platform/auth';
import { mount } from 'enzyme';
import { MemoryRouter, BrowserRouter as Router, Switch } from 'react-router-dom';

import { UnAuthOnlyRoute } from '..';
import { LOGIN_PAGE } from '../../data/constants';

jest.mock('@edx/frontend-platform/auth');

const RRD = require('react-router-dom');
// Just render plain div with its children
// eslint-disable-next-line react/prop-types
RRD.BrowserRouter = ({ children }) => <div>{ children }</div>;
module.exports = RRD;

const TestApp = () => (
  <Router>
    <div>
      <Switch>
        <UnAuthOnlyRoute path={LOGIN_PAGE} render={() => (<span>Login Page</span>)} />
      </Switch>
    </div>
  </Router>
);

describe('UnAuthOnlyRoute', () => {
  const routerWrapper = () => (
    <MemoryRouter initialEntries={[LOGIN_PAGE]}>
      <TestApp />
    </MemoryRouter>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have called with forceRefresh true', () => {
    const user = {
      username: 'gonzo',
      other: 'data',
    };
    auth.getAuthenticatedUser = jest.fn(() => user);
    auth.fetchAuthenticatedUser = jest.fn(() => ({ then: () => auth.getAuthenticatedUser() }));

    mount(routerWrapper());

    expect(auth.fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: true });
  });

  it('should have called with forceRefresh false', () => {
    auth.getAuthenticatedUser = jest.fn(() => null);
    auth.fetchAuthenticatedUser = jest.fn(() => ({ then: () => auth.getAuthenticatedUser() }));

    mount(routerWrapper());

    expect(auth.fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: false });
  });
});
