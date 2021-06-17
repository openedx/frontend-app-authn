import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LargeScreenLayout from '../LargeScreenLayout';
import MediumScreenHeader from '../MediumScreenHeader';
import SmallScreenHeader from '../SmallScreenHeader';

describe('ScreenLayout', () => {
  it('should display the form, pass as a child in SmallScreenLayout', () => {
    const smallScreen = mount(
      <IntlProvider locale="en">
        <div>
          <SmallScreenHeader />
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
          <MediumScreenHeader />
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
          <LargeScreenLayout />
          <form>
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(largeScreen.find('form').exists()).toEqual(true);
  });
});
