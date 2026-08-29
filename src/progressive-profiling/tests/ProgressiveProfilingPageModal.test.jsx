import { IntlProvider } from '@openedx/frontend-base';
import { fireEvent, render, screen } from '@testing-library/react';

import ProgressiveProfilingPageModal from '../ProgressiveProfilingPageModal';

const mockedNavigator = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockedNavigator,
}));

const renderModal = (props = {}) => render(
  <IntlProvider locale="en">
    <ProgressiveProfilingPageModal isOpen {...props} />
  </IntlProvider>,
);

describe('ProgressiveProfilingPageModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = 'https://authn.edx.org';
  });

  it('navigates in-app for a relative redirect', () => {
    renderModal({ redirectUrl: '/dashboard' });

    fireEvent.click(screen.getByText(/Continue to/));

    expect(mockedNavigator).toHaveBeenCalledWith('/dashboard');
  });

  it('leaves the app for an absolute redirect', () => {
    renderModal({ redirectUrl: 'https://elsewhere.example.com/next' });

    fireEvent.click(screen.getByText(/Continue to/));

    expect(mockedNavigator).not.toHaveBeenCalled();
    expect(window.location.href).toBe('https://elsewhere.example.com/next');
  });

  it('falls back to the site itself when no redirect is configured', () => {
    renderModal();

    fireEvent.click(screen.getByText(/Continue to/));

    expect(mockedNavigator).not.toHaveBeenCalled();
    expect(window.location.href).toBe('http://localhost:1996/');
  });
});
