import React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SmallScreenLayout from '../SmallScreenLayout';
import MediumScreenLayout from '../MediumScreenLayout';
import LargeScreenLayout from '../LargeScreenLayout';

describe('ScreenLayout', () => {
  it('should display the form, pass as a child in SmallScreenLayout', () => {
    const smallScreen = mount(
      <IntlProvider locale="en">
        <SmallScreenLayout>
          <form>
            <input type="text" />
          </form>
        </SmallScreenLayout>
      </IntlProvider>,
    );
    expect(smallScreen.find('form').exists());
  });

  it('should display the form, pass as a child in MediumScreenLayout', () => {
    const mediumScreen = mount(
      <IntlProvider locale="en">
        <MediumScreenLayout>
          <form>
            <input type="text" />
          </form>
        </MediumScreenLayout>
      </IntlProvider>,
    );
    expect(mediumScreen.find('form').exists());
  });

  it('should display the form, pass as a child in LargeScreenLayout', () => {
    const largeScreen = mount(
      <IntlProvider locale="en">
        <LargeScreenLayout>
          <form>
            <input type="text" />
          </form>
        </LargeScreenLayout>
      </IntlProvider>,
    );
    expect(largeScreen.find('form').exists());
  });
});
