import { useSelector } from 'react-redux';

import useAlgoliaRecommendations from './useAlgoliaRecommendations';
import useStaticRecommendations from './useStaticRecommendations';

/**
 * This hooks returns Algolia and Static recommendations (Trending and Popular products).
 * - Static recommendations are always returned.
 * - Algolia recommendations are returned only if functional cookies are enabled and algolia returns recommendations.
 * @param educationLevel
 * @returns {{isLoading: boolean, trendingProducts: *[], popularProducts: *[], algoliaRecommendations: *[]}}
 */
export default function useRecommendations(educationLevel) {
  const userCountry = useSelector((state) => state.register.backendCountryCode);
  const algoliaRecommendations = useAlgoliaRecommendations(userCountry, educationLevel);
  const staticRecommendations = useStaticRecommendations(userCountry);

  return {
    ...staticRecommendations,
    algoliaRecommendations: algoliaRecommendations.recommendations,
    isLoading: staticRecommendations.isLoading || algoliaRecommendations.isLoading,
  };
}
