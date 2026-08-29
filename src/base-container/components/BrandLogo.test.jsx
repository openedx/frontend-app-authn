import { CurrentAppProvider, IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import { render, screen } from '@testing-library/react';

import BrandLogo from './BrandLogo';
import { appId } from '../../constants';

const renderBrandLogo = (props = {}) => render(
  <IntlProvider locale="en">
    <CurrentAppProvider appId={appId}>
      <BrandLogo {...props} />
    </CurrentAppProvider>
  </IntlProvider>,
);

describe('BrandLogo', () => {
  beforeEach(() => {
    mergeAppConfig(appId, {
      LOGO_URL: 'http://example.com/logo.svg',
      LOGO_WHITE_URL: 'http://example.com/logo-white.svg',
    });
  });

  it('links the logo to the marketing site when one is configured', () => {
    mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: 'http://marketing.example.com' });

    renderBrandLogo({ className: 'logo' });

    expect(screen.getByRole('link').getAttribute('href')).toBe('http://marketing.example.com');
    expect(screen.getByRole('img').className).toContain('logo');
  });

  it('renders the logo unlinked when MARKETING_SITE_BASE_URL is unset', () => {
    mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: '' });

    renderBrandLogo({ className: 'logo' });

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('img').className).toContain('logo');
  });

  it.each([
    ['white', 'http://example.com/logo-white.svg'],
    ['default', 'http://example.com/logo.svg'],
  ])('renders the %s variant', (variant, url) => {
    mergeAppConfig(appId, { MARKETING_SITE_BASE_URL: '' });

    renderBrandLogo({ variant });

    expect(screen.getByRole('img').getAttribute('src')).toBe(url);
  });
});
