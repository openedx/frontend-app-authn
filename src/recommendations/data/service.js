import { camelCaseObject } from '@edx/frontend-platform';
import algoliasearch from 'algoliasearch/lite';

const INDEX_NAME = process.env.ALGOLIA_AUTHN_RECOMMENDATIONS_INDEX;

const getPersonalizedRecommendations = async (educationLevel) => {
  const facetFilters = ['product:Course', 'availability:Available now'];

  if (educationLevel) {
    facetFilters.push(`level:${educationLevel}`);
  }
  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_KEY);
  const index = client.initIndex(INDEX_NAME);
  const { hits } = await index.search('', {
    aroundLatLngViaIP: true,
    facetFilters,
  });

  return camelCaseObject(hits);
};

export default getPersonalizedRecommendations;
