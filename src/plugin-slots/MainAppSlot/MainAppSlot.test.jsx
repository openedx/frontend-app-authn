import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { render } from '@testing-library/react';

import MainAppSlot from './index';

jest.mock('@openedx/frontend-plugin-framework', () => ({
  PluginSlot: jest.fn(() => null),
}));

describe('MainAppSlot', () => {
  it('renders without crashing', () => {
    render(<MainAppSlot />);
  });

  it('renders a PluginSlot component', () => {
    render(<MainAppSlot />);
    expect(PluginSlot).toHaveBeenCalled();
  });

  it('passes the correct id prop to PluginSlot', () => {
    render(<MainAppSlot />);
    expect(PluginSlot).toHaveBeenCalledWith({ id: 'main_app_slot' }, {});
  });

  it('does not render any children', () => {
    const { container } = render(<MainAppSlot />);
    expect(container.firstChild).toBeNull();
  });
});
