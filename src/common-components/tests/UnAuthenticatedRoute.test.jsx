/* eslint-disable react/prop-types */
import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router, MemoryRouter, Switch } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';
import * as analytics from '@edx/frontend-platform/analytics';

import { UnAuthenticatedRoute } from '..';
import { DEFAULT_REDIRECT_URL, LOGIN_PAGE, REGISTER_PAGE } from '../../data/constants';

const RRD = require('react-router-dom');
// Just render plain div with its children
RRD.BrowserRouter = ({ children }) => <div>{ children }</div>;
module.exports = RRD;

jest.mock('@edx/frontend-platform/analytics');
analytics.sendPageEvent = jest.fn();

const TestApp = () => (
  <Router>
    <div>
      <Switch>
        <UnAuthenticatedRoute path={LOGIN_PAGE} render={() => (<span>Login Page</span>)} />
        <UnAuthenticatedRoute path={REGISTER_PAGE} render={() => (<span>Register Page</span>)} />
      </Switch>
    </div>
  </Router>
);

describe('UnAuthenticatedRoute', () => {
  const routerWrapper = (initialEntry) => (
    <MemoryRouter initialEntries={[initialEntry || LOGIN_PAGE]}>
      <TestApp />
    </MemoryRouter>
  );

  it('should redirect to dashboard if already logged in', () => {
    const dashboardURL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);
    delete window.location;
    window.location = { href: '' };
    const user = {
      username: 'gonzo',
      other: 'data',
    };
    const mockUseContext = jest.fn().mockImplementation(() => ({
      authenticatedUser: user,
      config: getConfig(),
    }));

    React.useContext = mockUseContext;
    mount(routerWrapper());

    expect(window.location.href).toBe(dashboardURL);
  });

  it('should render test login components', () => {
    const mockUseContext = jest.fn().mockImplementation(() => ({
      authenticatedUser: null,
      config: {},
    }));

    React.useContext = mockUseContext;
    const wrapper = mount(routerWrapper());

    expect(wrapper.find('span').text()).toBe('Login Page');
  });

  it('send page event when login page is rendered', () => {
    mount(routerWrapper());
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'login');
  });

  it('send page event when register page is rendered', () => {
    mount(routerWrapper(REGISTER_PAGE));
    expect(analytics.sendPageEvent).toHaveBeenCalledWith('login_and_registration', 'register');
  });
});
