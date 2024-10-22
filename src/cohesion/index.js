import { useEffect } from 'react';

const CohesionScript = () => {
  useEffect(() => {
    const cohesionScript = document.createElement('script');
    const idStitching = document.createElement('script');

    cohesionScript.innerHTML = `
      !function (co, h, e, s, i, o, n) {
        var d = 'documentElement'; var a = 'className'; h[d][a] += ' preampjs fusejs';
        n.k = e; co._Cohesion = n; co._Preamp = { k: s, start: new Date }; co._Fuse = { k: i }; co._Tagular = { k: o };
        [e, s, i, o].map(function (x) { co[x] = co[x] || function () { (co[x].q = co[x].q || []).push([].slice.call(arguments)) } });
        var b = function () { var u = h[d][a]; h[d][a] = u.replace(/ ?preampjs| ?fusejs/g, '') };
        h.addEventListener('DOMContentLoaded', function () {
            co.setTimeout(b, 3e3);
            co._Preamp.docReady = co._Fuse.docReady = !0
        }); var z = h.createElement('script');
        z.async = 1; z.src = 'https://beam.edx.org/cohesion/cohesion-latest.min.js';
        z.onerror = function () { var ce = 'error',f = 'function'; for (var o of co[e].q || []) o[0] === ce && typeof o[1] == f && o[1](); co[e] = function (n, cb) { n === ce && typeof cb == f && cb() }; b() };
        h.head.appendChild(z);
      }
      (window, document, 'cohesion', 'preamp', 'fuse', 'tagular', {
        tagular: {
          apiHost: 'https://beam.edx.org/v2/t',
          writeKey: "${process.env.COHESION_WRITE_KEY}",
          sourceKey: "${process.env.COHESION_SOURCE_KEY}",
          cookieDomain: 'edx.org',
          domainWhitelist: ["edx.org"],
          apiVersion: 'v2/t',
          multiparty: true,
          taggy: {
            enabled: true
          }
        }
      });
    `;
    document.head.appendChild(cohesionScript);

    // Id Stitching script (executed after the cohesionScript is loaded)
    cohesionScript.onload = () => {
      idStitching.innerHTML = `
        window.tagular("beam", {
          "@type": "core.Identify.v1",
          traits: {},
          externalIds: [
            {
              id: window.analytics.user().anonymousId(),
              type: "segment_anonym_id",
              collection: "users",
              encoding: "none",
            },
          ],
        });
      `;
      document.head.appendChild(idStitching);
    };

    // Cleanup
    return () => {
      document.head.removeChild(cohesionScript);
      document.head.removeChild(idStitching);
    };
  }, []);

  return null;
};

export default CohesionScript;
