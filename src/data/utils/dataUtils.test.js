import processLink from './dataUtils';

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
