/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */

import { fetchAuthenticatedUser, getAuthenticatedUser } from '@openedx/frontend-base';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  MemoryRouter, Route, BrowserRouter as Router, Routes,
} from 'react-router-dom';

import { UnAuthOnlyRoute } from '..';
import { registerPath } from '../../constants';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(),
  fetchAuthenticatedUser: jest.fn(),
  getUrlByRouteRole: jest.fn(() => '/dashboard'),
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
        <Route path={`/${registerPath}`} element={<UnAuthOnlyRoute><span>Register Page</span></UnAuthOnlyRoute>} />
      </Routes>
    </div>
  </Router>
);

describe('UnAuthOnlyRoute', () => {
  const routerWrapper = () => (
    <MemoryRouter initialEntries={[`/${registerPath}`]}>
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
