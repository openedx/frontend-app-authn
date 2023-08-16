const { camelCaseObject } = require('@edx/frontend-platform');

const processCourseSearchResult = (searchResultCourse) => {
  const camelCasedResult = camelCaseObject(searchResultCourse);

  return {
    activeCourseRun: {
      key: camelCasedResult.activeRunKey,
      type: camelCasedResult.activeRunType,
      marketingUrl: camelCasedResult.marketingUrl,
    },
    allowedIn: camelCasedResult.allowedIn,
    blockedIn: camelCasedResult.blockedIn,
    cardType: 'course',
    courseType: 'course',
    image: {
      src: camelCasedResult.cardImageUrl,
    },
    owners: camelCasedResult.owners,
    title: camelCasedResult.title,
    uuid: camelCasedResult.uuid,
    objectID: `course-${camelCasedResult.uuid}`,
    productSource: {
      slug: camelCasedResult.productSource,
    },
  };
};

export default processCourseSearchResult;
