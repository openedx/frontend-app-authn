/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */
import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { UnAuthOnlyRoute } from '..';
import { REGISTER_PAGE } from '../../data/constants';

import { MemoryRouter, BrowserRouter as Router, Switch } from 'react-router-dom';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(),
  fetchAuthenticatedUser: jest.fn(),
}));

const RRD = require('react-router-dom');
// Just render plain div with its children
// eslint-disable-next-line react/prop-types
RRD.BrowserRouter = ({ children }) => <div>{ children }</div>;
module.exports = RRD;

const TestApp = () => (
  <Router>
    <div>
      <Switch>
        <UnAuthOnlyRoute path={REGISTER_PAGE} render={() => (<span>Register Page</span>)} />
      </Switch>
    </div>
  </Router>
);

describe('UnAuthOnlyRoute', () => {
  const routerWrapper = () => (
    <MemoryRouter initialEntries={[REGISTER_PAGE]}>
      <TestApp />
    </MemoryRouter>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have called with forceRefresh true', async () => {
    const user = {
      username: 'gonzo',
      other: 'data',
    };

    getAuthenticatedUser.mockReturnValue(user);
    fetchAuthenticatedUser.mockReturnValueOnce(Promise.resolve(user));

    await act(async () => {
      await mount(routerWrapper());
    });

    expect(fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: true });
  });

  it('should have called with forceRefresh false', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    fetchAuthenticatedUser.mockReturnValueOnce(Promise.resolve(null));

    await act(async () => {
      await mount(routerWrapper());
    });

    expect(fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: false });
  });

  it('should not route to register page for authenticated users with non-embedded/normal experience', async () => {
    const user = {
      username: 'gonzo',
      other: 'data',
    };

    getAuthenticatedUser.mockReturnValue(user);
    fetchAuthenticatedUser.mockReturnValueOnce(Promise.resolve(user));

    let registerPage = null;

    await act(async () => {
      registerPage = await mount(routerWrapper());
    });

    expect(registerPage.find('span').exists()).toBeFalsy();
  });

  it('should route to register page for authenticated users with embedded experience', async () => {
    const user = {
      username: 'gonzo',
      other: 'data',
    };

    delete window.location;
    window.location = { href: getConfig().BASE_URL.concat(REGISTER_PAGE), search: '?variant=embedded&host=http://localhost/host-websit' };

    getAuthenticatedUser.mockReturnValue(user);
    fetchAuthenticatedUser.mockReturnValueOnce(Promise.resolve(user));

    let registerPage = null;

    await act(async () => {
      registerPage = await mount(routerWrapper());
    });

    expect(registerPage.find('span').exists()).toBeTruthy();
    expect(registerPage.find('span').text()).toBe('Register Page');
  });
});
