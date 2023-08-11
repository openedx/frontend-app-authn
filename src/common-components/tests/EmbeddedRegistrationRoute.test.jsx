/* eslint-disable import/no-import-module-exports */
/* eslint-disable react/function-component-definition */
import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { REGISTER_EMBEDDED_PAGE } from '../../data/constants';
import EmbeddedRegistrationRoute from '../EmbeddedRegistrationRoute';

import {
  MemoryRouter, Route, BrowserRouter as Router, Routes,
} from 'react-router-dom';

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
      embeddedRegistrationPage = await mount(routerWrapper());
    });

    expect(embeddedRegistrationPage.find('span').exists()).toBeFalsy();
  });

  it('should render embedded register page if host query param is available in the url (embedded)', async () => {
    delete window.location;
    window.location = {
      href: getConfig().BASE_URL.concat(REGISTER_EMBEDDED_PAGE),
      search: '?host=http://localhost/host-websit',
    };

    let embeddedRegistrationPage = null;

    await act(async () => {
      embeddedRegistrationPage = await mount(routerWrapper());
    });

    expect(embeddedRegistrationPage.find('span').exists()).toBeTruthy();
    expect(embeddedRegistrationPage.find('span').text()).toBe('Embedded Register Page');
  });
});
