import { renderHook } from '@testing-library/react';
import algoliasearchHelper from 'algoliasearch-helper';

import mockedRecommendedProducts from './mockedData';
import CreateAlgoliaSearchHelperMock from './test_utils/test_utils';
import isOneTrustFunctionalCookieEnabled from '../../../data/oneTrust';
import useAlgoliaRecommendations from '../hooks/useAlgoliaRecommendations';

jest.mock('algoliasearch-helper');

jest.mock('../../../data/oneTrust');

jest.mock('../../../data/algolia', () => ({
  initializeSearchClient: jest.fn(),
  getLocationRestrictionFilter: jest.fn((countryCode) => `NOT BLOCKED IN ${countryCode}`),
}));

jest.mock('../algoliaResultsParser', () => jest.fn((course) => course));

describe('useAlgoliaRecommendations Tests', () => {
  const MockSearchHelperWithData = new CreateAlgoliaSearchHelperMock(mockedRecommendedProducts);
  const MockSearchHelperWithoutData = new CreateAlgoliaSearchHelperMock();

  it('should fetch recommendations only if functional cookies are set', async () => {
    isOneTrustFunctionalCookieEnabled.mockImplementation(() => true);
    algoliasearchHelper.mockImplementation(() => MockSearchHelperWithData);
    const { result } = renderHook(
      () => useAlgoliaRecommendations('PK', 'Introductory'),
    );

    expect(result.current.recommendations).toEqual(mockedRecommendedProducts);
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch recommendations if functional cookies are not set', async () => {
    isOneTrustFunctionalCookieEnabled.mockImplementation(() => false);
    algoliasearchHelper.mockImplementation(() => MockSearchHelperWithData);
    const { result } = renderHook(
      () => useAlgoliaRecommendations('PK', 'Introductory'),
    );

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return empty list if no recommendations returned from Algolia', async () => {
    isOneTrustFunctionalCookieEnabled.mockImplementation(() => true);
    algoliasearchHelper.mockImplementation(() => MockSearchHelperWithoutData);
    const { result } = renderHook(
      () => useAlgoliaRecommendations('PK', 'Introductory'),
    );

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
