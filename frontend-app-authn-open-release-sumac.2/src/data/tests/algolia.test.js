import { getLocationRestrictionFilter } from '../algolia';

describe('algoliaUtilsTests', () => {
  it('test getLocationRestrictionFilter returns filter if country is passed', () => {
    const countryCode = 'PK';
    const filter = getLocationRestrictionFilter(countryCode);
    const expectedFilter = `NOT blocked_in:"${countryCode}" AND (allowed_in:"null" OR allowed_in:"${countryCode}")`;
    expect(filter).toEqual(expectedFilter);
  });
  it('test getLocationRestrictionFilter returns empty string if country is not passed', () => {
    const countryCode = '';
    const filter = getLocationRestrictionFilter(countryCode);
    const expectedFilter = '';
    expect(filter).toEqual(expectedFilter);
  });
});
