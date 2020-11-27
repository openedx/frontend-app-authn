import React from 'react';
import { mount } from 'enzyme';

import { getConfig } from '@edx/frontend-platform';

import LoggedInRedirect from '../LoggedInRedirect';
import { DEFAULT_REDIRECT_URL } from '../../data/constants';

describe('LoggedInRedirect', () => {
  const loggedInRedirect = (
    <LoggedInRedirect>
      <div>test</div>
    </LoggedInRedirect>
  );
  const dashboardURL = getConfig().LMS_BASE_URL.concat(DEFAULT_REDIRECT_URL);

  it('should redirect to dashboard if already logged in', () => {
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
    mount(loggedInRedirect);

    expect(window.location.href).toBe(dashboardURL);
  });

  it('should render child components', () => {
    const mockUseContext = jest.fn().mockImplementation(() => ({
      authenticatedUser: null,
      config: null,
    }));

    React.useContext = mockUseContext;
    const wrapper = mount(loggedInRedirect);

    expect(wrapper.find('div').length).toBe(1);
  });
});
