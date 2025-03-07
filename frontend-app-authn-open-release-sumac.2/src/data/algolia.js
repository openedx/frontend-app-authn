import { getConfig } from '@edx/frontend-platform';
import algoliasearch from 'algoliasearch';

// initialize Algolia workers
const initializeSearchClient = () => algoliasearch(
  getConfig().ALGOLIA_APP_ID,
  getConfig().ALGOLIA_SEARCH_API_KEY,
);

const getLocationRestrictionFilter = (userCountry) => {
  if (userCountry) {
    return `NOT blocked_in:"${userCountry}" AND (allowed_in:"null" OR allowed_in:"${userCountry}")`;
  }
  return '';
};

export {
  initializeSearchClient,
  getLocationRestrictionFilter,
};
