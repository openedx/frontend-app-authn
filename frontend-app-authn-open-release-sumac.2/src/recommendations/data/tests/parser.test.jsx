import mockedRecommendedProducts from './mockedData';
import processCourseSearchResult from '../algoliaResultsParser';

describe('AlgoliaResultsParserTests', () => {
  const dataToBeProcessed = {
    active_run_key: 'course-v1:TEST_COURSE_RUN',
    active_run_type: 'test_course_run_type',
    marketingUrl: 'test_marketingUrl',
    minEffort: 1,
    maxEffort: 2,
    weeksToComplete: 3,
    allowedIn: [],
    blockedIn: [],
    cardImageUrl: 'test_src',
    owners: [
      {
        name: 'Test Org',
        logoImageUrl: 'http://logourl.com',
      },
    ],
    title: 'test_title',
    uuid: 'test_uuid',
    recentEnrollmentCount: 1,
    productSource: 'test_source',
  };

  it('should parse results returned by Algolia', async () => {
    const parsedData = processCourseSearchResult(dataToBeProcessed);
    expect(parsedData).toEqual(mockedRecommendedProducts[0]);
  });
});
