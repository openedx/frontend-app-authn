module.exports = () => {
  if (process.env.COHESION_WRITE_KEY && process.env.COHESION_SOURCE_KEY) {
    !(function (co, h, e, s, i, o, n) {
      const d = "documentElement";
      const a = "className";
      h[d][a] += " preampjs fusejs";
      n.k = e;
      co._Cohesion = n;
      co._Preamp = { k: s, start: new Date() };
      co._Fuse = { k: i };
      co._Tagular = { k: o };
      [e, s, i, o].map((x) => {
        co[x] =
          co[x] ||
          function () {
            (co[x].q = co[x].q || []).push([].slice.call(arguments));
          };
      });
      const b = function () {
        const u = h[d][a];
        h[d][a] = u.replace(/ ?preampjs| ?fusejs/g, "");
      };
      h.addEventListener("DOMContentLoaded", () => {
        co.setTimeout(b, 3e3);
        co._Preamp.docReady = co._Fuse.docReady = !0;
      });
      const z = h.createElement("script");
      z.async = 1;
      z.src = "https://cdn.cohesionapps.com/cohesion/cohesion-latest.min.js";
      z.onerror = function () {
        const ce = "error";
        const f = "function";
        for (const o of co[e].q || []) {
          o[0] === ce && typeof o[1] === f && o[1]();
        }
        co[e] = function (n, cb) {
          n === ce && typeof cb === f && cb();
        };
        b();
      };
      h.head.appendChild(z);
    })(window, document, "cohesion", "preamp", "fuse", "tagular", {
      tagular: {
        writeKey: process.env.COHESION_WRITE_KEY,
        sourceKey: process.env.COHESION_SOURCE_KEY,
        taggy: {
          enabled: true,
        },
      },
    });
  }
};
