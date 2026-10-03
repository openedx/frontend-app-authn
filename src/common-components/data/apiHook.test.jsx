import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';

import { getThirdPartyAuthContext } from './api';
import { useThirdPartyAuthHook } from './apiHook';
import { ThirdPartyAuthQueryKeys } from './queryKeys';

jest.mock('./api', () => ({ getThirdPartyAuthContext: jest.fn() }));

describe('third-party context request identity', () => {
  let client;
  const context = hint => ({
    fieldDescriptions: { hint }, optionalFields: {}, thirdPartyAuthContext: {},
  });
  const Wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  Wrapper.propTypes = { children: PropTypes.node.isRequired };

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    getThirdPartyAuthContext.mockReset();
  });
  afterEach(() => client.clear());

  it('does not expose previous-hint cached success while the current hint is pending', async () => {
    const previousPayload = { tpa_hint: 'previous-hint', is_register_page: true };
    const currentPayload = { tpa_hint: 'current-hint', is_register_page: true };
    client.setQueryData(ThirdPartyAuthQueryKeys.byPage('register', previousPayload), context('previous'));
    getThirdPartyAuthContext.mockReturnValue(new Promise(() => {}));
    const view = renderHook(() => useThirdPartyAuthHook('register', currentPayload), { wrapper: Wrapper });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledWith(currentPayload));
    expect(view.result.current.isFetching).toBe(true);
    expect(view.result.current.isSuccess).toBe(false);
    expect(view.result.current.data).toBeUndefined();
    view.unmount();
  });

  it('keeps a late previous-payload response out of the current context', async () => {
    let resolvePrevious;
    let resolveCurrent;
    getThirdPartyAuthContext.mockImplementation(payload => new Promise((resolve) => {
      if (payload.tpa_hint === 'previous') { resolvePrevious = resolve; } else { resolveCurrent = resolve; }
    }));
    const view = renderHook(({ hint }) => useThirdPartyAuthHook('register', { tpa_hint: hint }), {
      initialProps: { hint: 'previous' }, wrapper: Wrapper,
    });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1));
    view.rerender({ hint: 'current' });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(2));
    await act(async () => resolvePrevious(context('previous')));
    expect(view.result.current.data).toBeUndefined();
    await act(async () => resolveCurrent(context('current')));
    await waitFor(() => expect(view.result.current.data).toEqual(context('current')));
    view.unmount();
  });

  it('uses the complete payload and page while reusing equivalent parameter values', async () => {
    getThirdPartyAuthContext.mockResolvedValue(context('fresh'));
    const view = renderHook(({ page, payload }) => useThirdPartyAuthHook(page, payload), {
      initialProps: { page: 'register', payload: { tpa_hint: 'hint', next: '/first' } }, wrapper: Wrapper,
    });
    await waitFor(() => expect(view.result.current.isSuccess).toBe(true));
    view.rerender({ page: 'register', payload: { next: '/first', tpa_hint: 'hint' } });
    expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1);
    view.rerender({ page: 'register', payload: { next: '/second', tpa_hint: 'hint' } });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(2));
    view.rerender({ page: 'login', payload: { next: '/second', tpa_hint: 'hint' } });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(3));
    view.unmount();
  });

  it('retains same-request data during refetch but exposes fetching and then failure', async () => {
    const payload = { tpa_hint: 'same-hint' };
    client.setQueryData(ThirdPartyAuthQueryKeys.byPage('register', payload), context('cached'));
    let rejectFetch;
    getThirdPartyAuthContext.mockReturnValue(new Promise((resolve, reject) => { rejectFetch = reject; }));
    const view = renderHook(() => useThirdPartyAuthHook('register', payload), { wrapper: Wrapper });
    await waitFor(() => expect(getThirdPartyAuthContext).toHaveBeenCalledTimes(1));
    expect(view.result.current.isSuccess).toBe(true);
    expect(view.result.current.isFetching).toBe(true);
    expect(view.result.current.data).toEqual(context('cached'));
    await act(async () => rejectFetch(new Error('context unavailable')));
    await waitFor(() => expect(view.result.current.isError).toBe(true));
    expect(view.result.current.isSuccess).toBe(false);
    expect(view.result.current.isFetching).toBe(false);
    view.unmount();
  });
});
