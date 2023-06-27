import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { mount } from 'enzyme';

import LargeLayout from '../components/default-layout/LargeLayout';
import MediumLayout from '../components/default-layout/MediumLayout';
import SmallLayout from '../components/default-layout/SmallLayout';

describe('ScreenLayout', () => {
  it('should display the form, pass as a child in SmallScreenLayout', () => {
    const smallScreen = mount(
      <IntlProvider locale="en">
        <div>
          <SmallLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(smallScreen.find('form').exists()).toEqual(true);
  });

  it('should display the form, pass as a child in MediumScreenLayout', () => {
    const mediumScreen = mount(
      <IntlProvider locale="en">
        <div>
          <MediumLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(mediumScreen.find('form').exists()).toEqual(true);
  });

  it('should display the form, pass as a child in LargeScreenLayout', () => {
    const largeScreen = mount(
      <IntlProvider locale="en">
        <div>
          <LargeLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(largeScreen.find('form').exists()).toEqual(true);
  });
});
