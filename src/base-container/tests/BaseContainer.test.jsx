import { IntlProvider, mergeAppConfig } from '@openedx/frontend-base';
import { render } from '@testing-library/react';
import { Context as ResponsiveContext } from 'react-responsive';

import BaseContainer from '../index';
import { testAppId } from '../../setupTest';

const LargeScreen = {
  wrappingComponent: ResponsiveContext.Provider,
  wrappingComponentProps: { value: { width: 1200 } },
};

describe('Base component tests', () => {
  it('should show default layout', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <BaseContainer>
          <div>Test Content</div>
        </BaseContainer>
      </IntlProvider>,
      LargeScreen,
    );

    expect(container.querySelector('.banner__image')).toBeNull();
    expect(container.querySelector('.large-screen-svg-primary')).toBeDefined();
  });

  it('renders Image layout when ENABLE_IMAGE_LAYOUT configuration is enabled', () => {
    mergeAppConfig(testAppId, {
      ENABLE_IMAGE_LAYOUT: true,
    });

    const { container } = render(
      <IntlProvider locale="en">
        <BaseContainer showWelcomeBanner={false}>
          <div>Test Content</div>
        </BaseContainer>
      </IntlProvider>,
      LargeScreen,
    );

    expect(container.querySelector('.banner__image')).toBeDefined();
  });
});
