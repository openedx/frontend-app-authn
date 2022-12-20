import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Router } from 'react-router-dom';

import { RESET_PAGE } from '../../data/constants';
import ChangePasswordPrompt from '../ChangePasswordPrompt';

const IntlChangePasswordPrompt = injectIntl(ChangePasswordPrompt);
const history = createMemoryHistory();

describe('ChangePasswordPromptTests', () => {
  let props = {};

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query,
      })),
    });
  });

  it('[nudge modal] should redirect to next url when user clicks close button', () => {
    const dashboardUrl = getConfig().BASE_URL.concat('/dashboard');
    props = {
      variant: 'nudge',
      redirectUrl: dashboardUrl,
    };

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    const changePasswordPrompt = mount(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlChangePasswordPrompt {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    changePasswordPrompt.find('button#password-security-close').simulate('click');
    expect(window.location.href).toBe(dashboardUrl);
  });

  it('[block modal] should redirect to reset password page when user clicks outside modal', async () => {
    props = {
      variant: 'block',
    };

    const changePasswordPrompt = mount(
      <IntlProvider locale="en">
        <MemoryRouter>
          <Router history={history}>
            <IntlChangePasswordPrompt {...props} />
          </Router>
        </MemoryRouter>
      </IntlProvider>,
    );

    await act(async () => {
      await changePasswordPrompt.find('div.pgn__modal-backdrop').first().simulate('click');
    });

    changePasswordPrompt.update();
    expect(history.location.pathname).toEqual(RESET_PAGE);
  });
});
