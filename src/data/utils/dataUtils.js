// Utility functions

export default function processLink(link) {
  let matches;
  link.replace(/(.*?)<a href=["']([^"']*).*?>([^<]+)<\/a>(.*)/g, function () { // eslint-disable-line func-names
    matches = Array.prototype.slice.call(arguments, 1, 5); // eslint-disable-line  prefer-rest-params
  });
  return matches;
}
