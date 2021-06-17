import { LOGIN_PAGE } from '../constants';
import processLink, { updatePathWithQueryParams } from './dataUtils';

describe('processLink', () => {
  it('should use the provided processLink function to', () => {
    const expectedHref = 'http://test.server.com/';
    const expectedText = 'test link';
    const link = `<a href="${expectedHref}">${expectedText}</a>`;

    const matches = processLink(link);

    expect(matches[1]).toEqual(expectedHref);
    expect(matches[2]).toEqual(expectedText);
  });
});

describe('updatePathWithQueryParams', () => {
  it('should append query params into the path', () => {
    const params = '?course_id=testCourseId';
    const expectedPath = `${LOGIN_PAGE}${params}`;

    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost/',
        search: params,
      },
    });
    const updatedPath = updatePathWithQueryParams(LOGIN_PAGE);

    expect(updatedPath).toEqual(expectedPath);
  });
});
