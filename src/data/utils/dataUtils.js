// Utility functions

export default function processLink(link) {
  let matches;
  link.replace(/(.*?)<a href=["']([^"']*).*?>([^<]+)<\/a>(.*)/g, function () { // eslint-disable-line func-names
    matches = Array.prototype.slice.call(arguments, 1, 5); // eslint-disable-line  prefer-rest-params
  });
  return matches;
}

export const getTpaProvider = (tpaHintProvider, primaryProviders, secondaryProviders) => {
  let tpaProvider = null;
  primaryProviders.forEach((provider) => {
    if (provider.id === tpaHintProvider) {
      tpaProvider = provider;
    }
  });

  if (!tpaProvider) {
    secondaryProviders.forEach((provider) => {
      if (provider.id === tpaHintProvider) {
        tpaProvider = provider;
      }
    });
  }
  return tpaProvider;
};

export const processTpaHintURL = (params) => {
  let tpaHint = null;
  tpaHint = params.get('tpa_hint');
  if (!tpaHint) {
    const next = params.get('next');
    if (next) {
      const index = next.indexOf('tpa_hint=');
      if (index !== -1) {
        tpaHint = next.substring(index + 'tpa_hint='.length, next.length);
      }
    }
  }
  return tpaHint;
};
