import { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';

import { filterLocationRestriction } from '../utils';

/**
 * This hooks returns Static recommendations (Trending and Popular products) after applying location restrictions.
 * @param countryCode
 * @returns {{isLoading: boolean, trendingProducts: *[], popularProducts: *[]}}
 * */
const useStaticRecommendations = (countryCode) => {
  const [isLoading, setLoading] = useState(true);
  const [popularProducts, setPopularProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    const popular = filterLocationRestriction(JSON.parse(getConfig().POPULAR_PRODUCTS), countryCode);
    const trending = filterLocationRestriction(JSON.parse(getConfig().TRENDING_PRODUCTS), countryCode);

    setPopularProducts(popular);
    setTrendingProducts(trending);
    setLoading(false);
  }, [countryCode]);

  return { popularProducts, trendingProducts, isLoading };
};

export default useStaticRecommendations;
