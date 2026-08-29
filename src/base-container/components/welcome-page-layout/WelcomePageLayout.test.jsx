import { CurrentAppProvider, IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import { render, screen } from '@testing-library/react';

import { AuthLargeLayout, AuthMediumLayout, AuthSmallLayout } from './index';
import { appId } from '../../../constants';

const renderLayout = (Layout) => render(
  <IntlProvider locale="en">
    <CurrentAppProvider appId={appId}>
      <Layout fullName="Ada Lovelace" />
    </CurrentAppProvider>
  </IntlProvider>,
);

describe('Welcome page layout', () => {
  beforeEach(() => {
    mergeAppConfig(appId, {
      LOGO_URL: 'http://example.com/logo.svg',
      LOGO_WHITE_URL: 'http://example.com/logo-white.svg',
    });
  });

  it.each([
    ['large', AuthLargeLayout],
    ['medium', AuthMediumLayout],
    ['small', AuthSmallLayout],
  ])('welcomes the user by name on the %s layout', (_name, Layout) => {
    renderLayout(Layout);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Ada Lovelace');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('Complete');
  });

  it('uses the regular logo rather than the light-on-dark one', () => {
    renderLayout(AuthLargeLayout);

    expect(screen.getByRole('img').getAttribute('src')).toBe('http://example.com/logo.svg');
  });
});
