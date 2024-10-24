import React from 'react';
import { Provider } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import mockTagular from '../../cohesion/utils';
import { RESET_PAGE } from '../../data/constants';
import ChangePasswordPrompt from '../ChangePasswordPrompt';

const IntlChangePasswordPrompt = injectIntl(ChangePasswordPrompt);
const mockedNavigator = jest.fn();
const mockStore = configureStore();
mockTagular();

const eventData = {
  pageType: 'test-page',
  elementType: 'test-element-type',
  webElementText: 'test-element-text',
  webElementName: 'test-element-name',
};

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
}));

describe('ChangePasswordPromptTests', () => {
  let props = {};
  let store = {};

  const initialState = {
    cohesion: { eventData: {} },
  };

  beforeAll(() => {
    store = mockStore(initialState);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query,
      })),
    });
  });

  it('[nudge modal] should redirect to next url when user clicks close button', async () => {
    const dashboardUrl = getConfig().BASE_URL.concat('/dashboard');
    props = {
      variant: 'nudge',
      redirectUrl: dashboardUrl,
    };

    store = mockStore({
      ...initialState,
      cohesion: {
        eventData,
      },
    });

    delete window.location;
    window.location = { href: getConfig().BASE_URL };

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <MemoryRouter>
            <IntlChangePasswordPrompt {...props} />
          </MemoryRouter>
        </Provider>
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(window.location.href).toBe(dashboardUrl);
    }, { timeout: 1100 });
  });

  it('[block modal] should redirect to reset password page when user clicks outside modal', async () => {
    props = {
      variant: 'block',
    };
    store = mockStore({
      ...initialState,
      cohesion: {
        eventData,
      },
    });
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <MemoryRouter>
            <IntlChangePasswordPrompt {...props} />
          </MemoryRouter>
        </Provider>
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
