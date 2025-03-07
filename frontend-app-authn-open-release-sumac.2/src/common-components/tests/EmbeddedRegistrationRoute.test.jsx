/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */
import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  MemoryRouter, Route, BrowserRouter as Router, Routes,
} from 'react-router-dom';

import { PAGE_NOT_FOUND, REGISTER_EMBEDDED_PAGE } from '../../data/constants';
import EmbeddedRegistrationRoute from '../EmbeddedRegistrationRoute';

const RRD = require('react-router-dom');
// Just render plain div with its children
// eslint-disable-next-line react/prop-types
RRD.BrowserRouter = ({ children }) => <div>{ children }</div>;
module.exports = RRD;

const TestApp = () => (
  <Router>
    <div>
      <Routes>
        <Route
          path={REGISTER_EMBEDDED_PAGE}
          element={<EmbeddedRegistrationRoute><span>Embedded Register Page</span></EmbeddedRegistrationRoute>}
        />
        <Route
          path={PAGE_NOT_FOUND}
          element={<span>Page not found</span>}
        />
      </Routes>
    </div>
  </Router>
);

describe('EmbeddedRegistrationRoute', () => {
  const routerWrapper = () => (
    <MemoryRouter initialEntries={[REGISTER_EMBEDDED_PAGE]}>
      <TestApp />
    </MemoryRouter>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render embedded register page if host query param is not available in the url', async () => {
    let embeddedRegistrationPage = null;
    await act(async () => {
      const { container } = await render(routerWrapper());
      embeddedRegistrationPage = container;
    });

    const renderedPage = embeddedRegistrationPage.querySelector('span');
    expect(renderedPage.textContent).toBe('Page not found');
  });

  it('should render embedded register page if host query param is available in the url (embedded)', async () => {
    delete window.location;
    window.location = {
      href: getConfig().BASE_URL.concat(REGISTER_EMBEDDED_PAGE),
      search: '?host=http://localhost/host-websit',
    };

    let embeddedRegistrationPage = null;
    await act(async () => {
      const { container } = await render(routerWrapper());
      embeddedRegistrationPage = container;
    });

    const renderedPage = embeddedRegistrationPage.querySelector('span');
    expect(renderedPage).toBeTruthy();
    expect(renderedPage.textContent).toBe('Embedded Register Page');
  });
});
