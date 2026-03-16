import { loginPath } from '../../constants';
import { updatePathWithQueryParams } from '../utils/dataUtils';

describe('updatePathWithQueryParams', () => {
  it('should append query params into the path', () => {
    const params = '?course_id=testCourseId';
    const expectedPath = `${loginPath}${params}`;

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/',
        search: params,
      },
    });
    const updatedPath = updatePathWithQueryParams(loginPath);

    expect(updatedPath).toEqual(expectedPath);
  });
});
