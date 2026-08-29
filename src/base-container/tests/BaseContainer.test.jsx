import { CurrentAppProvider, IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import { render } from '@testing-library/react';
import { Context as ResponsiveContext } from 'react-responsive';

import BaseContainer from '../index';
import { appId } from '../../constants';

const renderAtLargeScreen = (props = {}) => render(
  <ResponsiveContext.Provider value={{ width: 1200 }}>
    <IntlProvider locale="en">
      <CurrentAppProvider appId={appId}>
        <BaseContainer {...props}>
          <div>Test Content</div>
        </BaseContainer>
      </CurrentAppProvider>
    </IntlProvider>
  </ResponsiveContext.Provider>,
);

describe('Base component tests', () => {
  it('should show default layout', () => {
    mergeAppConfig(appId, { ENABLE_IMAGE_LAYOUT: false });

    const { container } = renderAtLargeScreen();

    expect(container.querySelector('.banner__image')).toBeNull();
    expect(container.querySelector('.large-screen-svg-primary')).not.toBeNull();
  });

  it('renders Image layout when ENABLE_IMAGE_LAYOUT configuration is enabled', () => {
    mergeAppConfig(appId, { ENABLE_IMAGE_LAYOUT: true });

    const { container } = renderAtLargeScreen({ showWelcomeBanner: false });

    expect(container.querySelector('.banner__image')).not.toBeNull();
    expect(container.querySelector('.large-screen-svg-primary')).toBeNull();
  });

  it('renders the welcome banner over either layout', () => {
    mergeAppConfig(appId, { ENABLE_IMAGE_LAYOUT: false });

    const { container } = renderAtLargeScreen({ showWelcomeBanner: true, fullName: 'Ada' });

    expect(container.querySelector('.large-screen-svg-light')).not.toBeNull();
    expect(container.textContent).toContain('Ada');
  });
});
