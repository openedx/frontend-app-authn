##################
frontend-app-authn
##################

|license-badge| |status-badge| |ci-badge| |codecov-badge| |semantic-release|

Authn is a `frontend-base`_ application: a library that plugs into the Open edX
frontend shell, rather than a standalone micro-frontend bundled with its own
webpack build.

.. _frontend-base: https://github.com/openedx/frontend-base

********
Purpose
********

This app is responsible for the login, registration and password reset
functionality, and serves:

- Register page
- Login page
- Forgot password page
- Reset password page
- Progressive profiling page

*********************
Branches and Releases
*********************

This app is published to NPM by ``semantic-release``, and its branches follow
`OEP-10 ADR 0002`_:

``master``
  Unstable.  Every merge publishes a prerelease on the ``alpha`` dist-tag.
  Breaking changes land here with no DEPR process and no warning, so it is not
  supported in production.  All changes, including bug fixes, should target this
  branch first.

``stable``
  Carries the newest stable major and owns the ``latest`` dist-tag.  Changes
  arrive here as backports from ``master``, and no breaking change lands after
  publication.

``n.x`` and ``n.m.x``
  Maintenance branches for majors and minors that ``stable`` has moved past.
  Each owns the dist-tag matching its own name, so consumers select a maintained
  line by semver range, e.g. ``"1.x"``.

``stable`` is cut, and ``1.0.0`` is the current stable release.  Both
``.releaserc`` and the ``Release CI`` workflow know the whole layout, including
the maintenance branch patterns, so a new line starts publishing as soon as it
is pushed.

This repository is no longer branched or tagged for Open edX releases in its own
right.  It participates by published version instead, per `OEP-10 ADR 0003`_.

The micro-frontend this app replaces goes on living on `legacy-mfe`_, which is
where any further ``release/RELEASENAME`` branches for it are cut, for as long as
a supported release still ships it.  Teak, Ulmo and Verawood all do.

.. _OEP-10 ADR 0002: https://docs.openedx.org/projects/openedx-proposals/en/latest/processes/oep-0010/decisions/0002-frontend-stable-branches.html
.. _OEP-10 ADR 0003: https://docs.openedx.org/projects/openedx-proposals/en/latest/processes/oep-0010/decisions/0003-frontend-release-strategy.html
.. _legacy-mfe: https://github.com/openedx/frontend-app-authn/tree/legacy-mfe

***************
Getting Started
***************

Prerequisites
=============

A running Open edX instance is needed to serve this app's backend APIs.
`Tutor`_ in development mode is the usual choice, and ``site.config.dev.tsx``
already points at its default hostnames.

Unlike a micro-frontend, this app is neither built nor served by ``tutor-mfe``.
The dev server below runs on the host.  Note that ``tutor-mfe`` v22 and later do
ship this app as a frontend-base application for *deployment*, disabled by
default; see `Frontend apps`_ in its README to enable it.

.. _Tutor: https://github.com/overhangio/tutor
.. _Frontend apps: https://github.com/overhangio/tutor-mfe#frontend-apps

Cloning and Startup
===================

1. Clone the repo:

   ``git clone https://github.com/openedx/frontend-app-authn.git``

2. Use the version of Node specified in the ``.nvmrc`` file.

   Using other major versions of Node *may* work, but is unsupported.  This
   repository includes an ``.nvmrc`` file to help set the correct Node version
   via `nvm <https://github.com/nvm-sh/nvm>`_.

3. Install npm dependencies:

   ``cd frontend-app-authn && npm install``

4. Start the dev server:

   ``npm run dev``

The dev server defaults to ``PORT=1999 PUBLIC_PATH=/authn`` (set in the ``dev``
script in ``package.json``) and is available at
`http://apps.local.openedx.io:1999/authn <http://apps.local.openedx.io:1999/authn>`_.

Configuration used by the dev server is defined in ``site.config.dev.tsx`` at
the repo root.

Local Development Against ``frontend-base``
===========================================

To develop this app and a local checkout of ``frontend-base`` in tandem, use the
built-in npm workspace support:

.. code-block:: sh

    mkdir -p packages/frontend-base
    sudo mount --bind /path/to/frontend-base packages/frontend-base
    npm install
    npm run dev:packages

Bind mounts are used instead of symlinks because Node resolves symlinks to their
real paths, which breaks hoisted dependency resolution.  When you are done,
unmount with ``sudo umount packages/frontend-base``.

Configuration
=============

This app is no longer configured by build-time environment variables.
``getAppConfig`` resolves three sources, in order of increasing precedence: the
app's bundled defaults, the site's ``commonAppConfig``, and the app's ``config``.
The first is the app author's, at build time; the other two are the operator's,
the second applying to every app on the site and the third to this app alone.  In
edx-platform they arrive as ``MFE_CONFIG`` and ``MFE_CONFIG_OVERRIDES['authn']``
respectively.

The full list of keys and their defaults is the ``config`` block in
``src/app.ts``.  Most are self-explanatory support links, logo URLs and branding
strings.  The ones worth describing:

.. list-table::
   :widths: 30 50 20
   :header-rows: 1

   * - Name
     - Description / Usage
     - Example

   * - ``ALLOW_PUBLIC_ACCOUNT_CREATION``
     - Whether visitors may register themselves.  When false, the registration
       page and the links to it are hidden.
     - ``true``

   * - ``DISABLE_ENTERPRISE_LOGIN``
     - Disables the enterprise login flow.
     - ``true``

   * - ``ENABLE_AUTO_GENERATED_USERNAME``
     - Generates the username from the registration form rather than asking for
       one.
     - ``false``

   * - ``ENABLE_DYNAMIC_REGISTRATION_FIELDS``
     - Enables configurable registration fields.  Must be enabled to show any
       registration field besides the defaults (name, email, username,
       password).
     - ``false``

   * - ``ENABLE_IMAGE_LAYOUT``
     - Allows images in the base container layout.  See `Modifying base
       container <docs/how_tos/modifying_base_container.rst>`_.
     - ``false``

   * - ``ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN``
     - Enables progressive profiling.  If enabled, users are redirected to a
       second page where data for optional registration fields is collected.
     - ``false``

   * - ``POST_REGISTRATION_REDIRECT_URL``
     - Where to send a user after registration, overriding the default route.
     - ``''``

   * - ``SHOW_REGISTRATION_LINKS``
     - Whether to show links to the registration page from the other pages.
     - ``true``

edX-specific Configuration
==========================

The following key enables an integration with a closed-source service private to
the edX organization, and might be unsupported in Open edX.

.. list-table::
   :widths: 30 50 20
   :header-rows: 1

   * - Name
     - Description / Usage
     - Example

   * - ``MARKETING_EMAILS_OPT_IN``
     - Enables opting in to marketing emails, to capture user consent for
       sending them.
     - ``''``

How To Contribute
=================

Contributions are very welcome, and strongly encouraged! We've
put together `some documentation that describes our contribution process <https://docs.openedx.org/en/latest/developers/references/developer_guide/process/index.html>`_.

Even though they were written with edx-platform in mind, the guidelines should be followed for Open edX code in general.

PR description template should be automatically applied if you are sending PR from github interface; otherwise you
can find it it at `PULL_REQUEST_TEMPLATE.md <https://github.com/openedx/frontend-app-authn/blob/master/.github/pull_request_template.md>`_

This project is currently accepting all types of contributions, bug fixes and security fixes.

Getting Help
============

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-authn/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/community/connect

The Open edX Code of Conduct
============================
All community members are expected to follow the `Open edX Code of Conduct <https://openedx.org/code-of-conduct/>`_.

People
======
The assigned maintainers for this component and other project details may be
found in `Backstage <https://backstage.openedx.org/catalog/default/group/2u-infinity>`_. Backstage pulls this data from the ``catalog-info.yaml``
file in this repo.

Reporting Security Issues
=========================

Please do not report security issues in public. Please email security@openedx.org.

Known Issues
============

None

License
=======

The code in this repository is licensed under the GNU Affero General Public License v3.0, unless
otherwise noted.

Please see `LICENSE <https://github.com/openedx/frontend-app-authn/blob/master/LICENSE>`_ for details.


==============================


.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-authn.svg
    :target: https://github.com/openedx/frontend-app-authn/blob/master/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen
    :alt: Maintained

.. |ci-badge| image:: https://github.com/openedx/frontend-app-authn/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/openedx/frontend-app-authn/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-app-authn/coverage.svg?branch=master
    :target: https://codecov.io/github/openedx/frontend-app-authn?branch=master
    :alt: Codecov

.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
    :target: https://github.com/semantic-release/semantic-release
    :alt: semantic-release
