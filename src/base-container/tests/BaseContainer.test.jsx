import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';
import { Context as ResponsiveContext } from 'react-responsive';

import BaseContainer from '../index';

const LargeScreen = {
  wrappingComponent: ResponsiveContext.Provider,
  wrappingComponentProps: { value: { width: 1200 } },
};

describe('Base component tests', () => {
  it('should should default layout', () => {
    const baseContainer = mount(
      <IntlProvider locale="en">
        <BaseContainer />
      </IntlProvider>,
      LargeScreen,
    );

    expect(baseContainer.find('.banner__image').exists()).toBeFalsy();
    expect(baseContainer.find('.large-screen-svg-primary').exists()).toBeTruthy();
  });

  it('[experiment] should show image layout for treatment group', () => {
    window.experiments = {
      rebrandExperiment: {
        variation: 'image-layout',
      },
    };

    const baseContainer = mount(
      <IntlProvider locale="en">
        <BaseContainer />
      </IntlProvider>,
      LargeScreen,
    );

    expect(baseContainer.find('.banner__image').exists()).toBeTruthy();
  });
});
