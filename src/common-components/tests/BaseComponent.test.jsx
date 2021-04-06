import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SmallScreenLayout from '../SmallScreenLayout';
import MediumScreenLayout from '../MediumScreenLayout';
import LargeScreenLayout from '../LargeScreenLayout';

const prop = (
  <form>
    <div>
      <input type="text" name="username" id="username" />
      <input type="password" name="password" id="password" />
    </div>
    <div>
      <input type="submit" name="submit" value="Submit" />
    </div>
  </form>
);

it('BaseComponent should match small screen layout with snapshot', () => {
  const tree = renderer.create(
    <IntlProvider locale="en">
      <SmallScreenLayout>
        { prop }
      </SmallScreenLayout>
    </IntlProvider>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('BaseComponent should match medium screen layout with snapshot', () => {
  const tree = renderer.create(
    <IntlProvider locale="en">
      <MediumScreenLayout>
        { prop }
      </MediumScreenLayout>
    </IntlProvider>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('BaseComponent should match large screen layout with snapshot', () => {
  const tree = renderer.create(
    <IntlProvider locale="en">
      <LargeScreenLayout>
        { prop }
      </LargeScreenLayout>
    </IntlProvider>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
