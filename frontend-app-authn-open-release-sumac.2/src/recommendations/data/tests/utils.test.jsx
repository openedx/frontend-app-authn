import mockedProductData from '../../tests/mockedData';
import { convertCourseRunKeyToCourseKey, filterLocationRestriction, useProductType } from '../utils';

describe('UtilsTests', () => {
  it('should return the courseKey after parsing the activeCourseRun key', async () => {
    const courseKey = convertCourseRunKeyToCourseKey('course-v1:Demox+Test101+2023');
    expect(courseKey).toEqual('Demox+Test101');
  });
  it('should filter courses on the basis of country code', async () => {
    const products = filterLocationRestriction(mockedProductData, 'PK');
    expect(products.length).toEqual(1);
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
