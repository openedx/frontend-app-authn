import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router, MemoryRouter, Switch } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';

import { UnAuthOnlyRoute } from '..';
import { DEFAULT_REDIRECT_URL, LOGIN_PAGE } from '../../data/constants';

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
});
