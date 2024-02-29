import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  fireEvent, render, screen,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import { RESET_PAGE } from '../../data/constants';
import ChangePasswordPrompt from '../ChangePasswordPrompt';

const IntlChangePasswordPrompt = injectIntl(ChangePasswordPrompt);
const mockedNavigator = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
}));

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

    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlChangePasswordPrompt {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText('Close'));
    expect(window.location.href).toBe(dashboardUrl);
  });

  it('[block modal] should redirect to reset password page when user clicks outside modal', async () => {
    props = {
      variant: 'block',
    };

    render(
      <IntlProvider locale="en">
        <MemoryRouter>
          <IntlChangePasswordPrompt {...props} />
        </MemoryRouter>
      </IntlProvider>,
    );

    await act(async () => {
      await fireEvent.click(screen.getByText(
        '',
        { selector: '.pgn__modal-backdrop' },
      ));
    });

    expect(mockedNavigator).toHaveBeenCalledWith(RESET_PAGE);
  });
});
