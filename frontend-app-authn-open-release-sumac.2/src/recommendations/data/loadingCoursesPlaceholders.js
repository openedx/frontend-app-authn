const placeholderCourse = {
  activeCourseRun: {
    key: 'course',
    marketingUrl: '/',
    type: 'Verified and Audit',
  },
  cardType: 'course',
  image: {
    src: './',
  },
  inProspectus: true,
  objectID: 'skeleton',
  owners: [{
    key: 'skeleton',
    logoImageUrl: './',
    name: 'skeleton',
  }],
  position: 0,
  prospectusPath: './',
  queryID: 'skeleton',
  recentEnrollmentCount: 0,
  title: 'skeleton',
  topics: [{
    topic: 'skeleton',
  }],
  uuid: 'skeleton',
};

const loadingCoursesPlaceHolders = [
  { ...placeholderCourse, uuid: '294ea4rtn2117', courseType: 'course' },
  { ...placeholderCourse, uuid: '294fga4681117', courseType: 'course' },
  { ...placeholderCourse, uuid: '294ea4278e117', courseType: 'course' },
  { ...placeholderCourse, uuid: '294eax2rtg117', courseType: 'course' },
];

export default loadingCoursesPlaceHolders;
