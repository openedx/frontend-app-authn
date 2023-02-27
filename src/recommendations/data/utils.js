export const convertCourseRunKeytoCourseKey = (courseRunKey) => {
  if (!courseRunKey) {
    return '';
  }
  const newKeyFormat = courseRunKey.includes('+');
  if (newKeyFormat) {
    const splitCourseRunKey = courseRunKey.split(':').slice(-1)[0];
    const splitCourseKey = splitCourseRunKey.split('+').slice(0, 2);
    return `${splitCourseKey[0]}+${splitCourseKey[1]}`;
  }
  const splitCourseKey = courseRunKey.split('/').slice(0, 2);
  return `${splitCourseKey[0]}+${splitCourseKey[1]}`;
};

export default {
  convertCourseRunKeytoCourseKey,
};
