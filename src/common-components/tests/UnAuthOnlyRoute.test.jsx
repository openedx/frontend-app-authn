/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */
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

  it('redirects a bootstrapped user without another session refresh', async () => {
    const user = { username: 'gonzo' };
    getAuthenticatedUser.mockReturnValue(user);
    fetchAuthenticatedUser.mockResolvedValue(user);
    await act(async () => { render(routerWrapper()); });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(fetchAuthenticatedUser).not.toHaveBeenCalled();
  });

  it('renders the anonymous registration route without a duplicate refresh', async () => {
    getAuthenticatedUser.mockReturnValue(null);
    fetchAuthenticatedUser.mockResolvedValue(null);
    let view;
    await act(async () => { view = render(routerWrapper()); });
    expect(view.getByText('Register Page')).toBeTruthy();
    expect(fetchAuthenticatedUser).not.toHaveBeenCalled();
  });
});
