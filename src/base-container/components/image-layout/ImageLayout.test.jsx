import { CurrentAppProvider, IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import { render, screen } from '@testing-library/react';

import {
  ImageExtraSmallLayout, ImageLargeLayout, ImageMediumLayout, ImageSmallLayout,
} from './index';
import { appId } from '../../../constants';

const renderLayout = (Layout) => render(
  <IntlProvider locale="en">
    <CurrentAppProvider appId={appId}>
      <Layout />
    </CurrentAppProvider>
  </IntlProvider>,
);

const layouts = [
  ['extra small', ImageExtraSmallLayout, 'BANNER_IMAGE_EXTRA_SMALL', 'extra-small-layout'],
  ['small', ImageSmallLayout, 'BANNER_IMAGE_SMALL', 'small-layout'],
  ['medium', ImageMediumLayout, 'BANNER_IMAGE_MEDIUM', 'medium-layout'],
  ['large', ImageLargeLayout, 'BANNER_IMAGE_LARGE', 'large-layout'],
];

describe('Image layout', () => {
  it.each(layouts)('paints the %s banner when one is configured', (_name, Layout, key, className) => {
    mergeAppConfig(appId, { [key]: 'http://example.com/banner.jpg' });

    const { container } = renderLayout(Layout);

    expect(container.querySelector(`.${className}`).style.backgroundImage)
      .toBe('url(http://example.com/banner.jpg)');
  });

  it.each(layouts)('leaves the %s banner flat when none is configured', (_name, Layout, key, className) => {
    mergeAppConfig(appId, { [key]: '' });

    const { container } = renderLayout(Layout);

    const banner = container.querySelector(`.${className}`);
    expect(banner.style.backgroundImage).toBe('');
    expect(banner.className).toContain('bg-primary-500');
  });

  it('shows the site logo and the banner heading', () => {
    mergeAppConfig(appId, { LOGO_WHITE_URL: 'http://example.com/logo-white.svg' });

    renderLayout(ImageLargeLayout);

    expect(screen.getByRole('img').getAttribute('src')).toBe('http://example.com/logo-white.svg');
    expect(screen.getByRole('heading').textContent).toContain('Your career turning point');
  });
});
