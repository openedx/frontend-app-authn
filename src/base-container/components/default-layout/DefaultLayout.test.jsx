import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import { DefaultLargeLayout, DefaultMediumLayout, DefaultSmallLayout } from './index';

describe('Default Layout tests', () => {
  it('should display the form passed as a child in SmallScreenLayout', () => {
    const smallScreen = mount(
      <IntlProvider locale="en">
        <div>
          <DefaultSmallLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(smallScreen.find('form').exists()).toEqual(true);
  });

  it('should display the form passed as a child in MediumScreenLayout', () => {
    const mediumScreen = mount(
      <IntlProvider locale="en">
        <div>
          <DefaultMediumLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(mediumScreen.find('form').exists()).toEqual(true);
  });

  it('should display the form passed as a child in LargeScreenLayout', () => {
    const largeScreen = mount(
      <IntlProvider locale="en">
        <div>
          <DefaultLargeLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(largeScreen.find('form').exists()).toEqual(true);
  });
});
