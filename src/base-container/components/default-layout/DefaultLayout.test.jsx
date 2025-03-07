import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';

import { DefaultLargeLayout, DefaultMediumLayout, DefaultSmallLayout } from './index';

describe('Default Layout tests', () => {
  it('should display the form passed as a child in SmallScreenLayout', () => {
    render(
      <IntlProvider locale="en">
        <div>
          <DefaultSmallLayout />
          <form aria-label="form">
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(screen.getByRole('form')).toBeDefined();
  });

  it('should display the form passed as a child in MediumScreenLayout', () => {
    render(
      <IntlProvider locale="en">
        <div>
          <DefaultMediumLayout />
          <form aria-label="form">
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(screen.getByRole('form')).toBeDefined();
  });

  it('should display the form passed as a child in LargeScreenLayout', () => {
    render(
      <IntlProvider locale="en">
        <div>
          <DefaultLargeLayout />
          <form aria-label="form">
            <input type="text" />
          </form>
        </div>
      </IntlProvider>,
    );
    expect(screen.getByRole('form')).toBeDefined();
  });
});
