import { getSiteConfig } from '@openedx/frontend-base';
import { render, waitFor } from '@testing-library/react';
import {
  MemoryRouter, Navigate, Outlet, Route, Routes,
} from 'react-router-dom';

import { notFoundPath, registerEmbeddedPath } from '../../constants';
import EmbeddedRegistrationRoute from '../EmbeddedRegistrationRoute';

describe('EmbeddedRegistrationRoute', () => {
  const routerWrapper = () => (
    <MemoryRouter initialEntries={[`/authn/${registerEmbeddedPath}`]}>
      <Routes>
        <Route path="/authn" element={<Outlet />}>
          <Route
            path={registerEmbeddedPath}
            element={<EmbeddedRegistrationRoute><span>Embedded Register Page</span></EmbeddedRegistrationRoute>}
          />
          <Route
            path={notFoundPath}
            element={<span>Page not found</span>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render embedded register page if host query param is not available in the url', async () => {
    const { container } = render(routerWrapper());

    await waitFor(() => {
      const renderedPage = container.querySelector('span');
      expect(renderedPage).not.toBeNull();
      expect(renderedPage.textContent).toBe('Page not found');
    });
  });

  it('should render embedded register page if host query param is available in the url (embedded)', () => {
    delete window.location;
    window.location = {
      href: getSiteConfig().baseUrl.concat('/', registerEmbeddedPath),
      search: '?host=http://localhost/host-websit',
    };

    const { container } = render(routerWrapper());

    const renderedPage = container.querySelector('span');
    expect(renderedPage).toBeTruthy();
    expect(renderedPage.textContent).toBe('Embedded Register Page');
  });
});
