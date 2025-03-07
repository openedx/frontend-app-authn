/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */
import React from 'react';

import { fetchAuthenticatedUser, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  MemoryRouter, Route, BrowserRouter as Router, Routes,
} from 'react-router-dom';

import { UnAuthOnlyRoute } from '..';
import { REGISTER_PAGE } from '../../data/constants';

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
      <Routes>
        <Route path={REGISTER_PAGE} element={<UnAuthOnlyRoute><span>Register Page</span></UnAuthOnlyRoute>} />
      </Routes>
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
      await render(routerWrapper());
    });

    expect(fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: true });
  });

  it('should have called with forceRefresh false', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    fetchAuthenticatedUser.mockReturnValueOnce(Promise.resolve(null));

    await act(async () => {
      await render(routerWrapper());
    });

    expect(fetchAuthenticatedUser).toBeCalledWith({ forceRefresh: false });
  });
});
