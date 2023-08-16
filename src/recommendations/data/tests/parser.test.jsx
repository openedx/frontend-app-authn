import mockedRecommendedProducts from './mockedData';
import processCourseSearchResult from '../algoliaResultsParser';

describe('AlgoliaResultsParserTests', () => {
  const dataToBeProcessed = {
    activeRunKey: 'course-v1:TEST_COURSE_RUN',
    activeRunType: 'test_course_run_type',
    marketingUrl: 'test_marketingUrl',
    minEffort: 1,
    maxEffort: 2,
    weeksToComplete: 3,
    allowedIn: [],
    blockedIn: [],
    cardImageUrl: 'test_src',
    owners: [],
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
