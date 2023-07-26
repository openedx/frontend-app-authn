import { convertCourseRunKeytoCourseKey, useProductType } from '../utils';

describe('UtilsTests', () => {
  it('should return the courseKey after parsing the activeCourseRun key', async () => {
    const courseKey = convertCourseRunKeytoCourseKey('course-v1:Demox+Test101+2023');
    expect(courseKey).toEqual('Demox+Test101');
  });
  it('should return courseType and programType', async () => {
    const programType = useProductType(undefined, 'Professional Certificate');
    expect(programType).toEqual('Professional Certificate');
    const courseType = useProductType('verified-audit', undefined);
    expect(courseType).toEqual('Course');
    const noCourseType = useProductType(undefined, undefined);
    expect(noCourseType).toEqual(undefined);
  });
});
