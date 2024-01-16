import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { Context as ResponsiveContext } from 'react-responsive';

import BaseContainer from '../index';

const LargeScreen = {
  wrappingComponent: ResponsiveContext.Provider,
  wrappingComponentProps: { value: { width: 1200 } },
};

describe('Base component tests', () => {
  it('should show default layout', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <BaseContainer />
      </IntlProvider>,
      LargeScreen,
    );

    expect(container.querySelector('.banner__image')).toBeNull();
    expect(container.querySelector('.large-screen-svg-primary')).toBeDefined();
  });

  it('[experiment] should show image layout for treatment group', () => {
    window.experiments = {
      rebrandExperiment: {
        variation: 'image-layout',
      },
    };

    const { container } = render(
      <IntlProvider locale="en">
        <BaseContainer />
      </IntlProvider>,
      LargeScreen,
    );

    expect(container.querySelector('.banner__image')).toBeDefined();
  });
});
