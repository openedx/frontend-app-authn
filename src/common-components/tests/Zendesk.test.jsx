import { IntlProvider } from '@edx/frontend-platform/i18n';
import renderer from 'react-test-renderer';

import Zendesk from '../Zendesk';

jest.mock('react-zendesk', () => 'Zendesk');

describe('Zendesk Help', () => {
  it('should match login page third party auth alert message snapshot', () => {
    const tree = renderer.create(
      <IntlProvider locale="en">
        <Zendesk />
      </IntlProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
