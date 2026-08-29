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
app's bundled ``defaultConfig``, the site's ``commonAppConfig``, and the app's
``config``.  The first is the app author's, at build time; the other two are the
operator's, the second applying to every app on the site and the third to this
app alone.

Authn bundles three defaults, in ``src/app.ts``:
``DISABLE_ENTERPRISE_LOGIN``, ``LOGO_URL`` and ``LOGO_WHITE_URL``.  Every other
field below is supplied by the operator.

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Name
     - Description / Usage

   * - ``ACTIVATION_EMAIL_SUPPORT_LINK``
     - Support page linked from the account-activation error message.  Unset,
       the message names support as plain text rather than a link.

   * - ``ALLOW_PUBLIC_ACCOUNT_CREATION``
     - Whether visitors may register themselves.  Set it to ``false`` to hide
       the registration page and the links to it; visitors may register
       otherwise.

   * - ``AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK``
     - Support page linked from the progressive-profiling form.  Not rendered
       when unset.

   * - ``BANNER_IMAGE_EXTRA_SMALL``, ``BANNER_IMAGE_SMALL``,
       ``BANNER_IMAGE_MEDIUM``, ``BANNER_IMAGE_LARGE``
     - Banner images for the image layout, one per breakpoint.  Where one is
       unset the banner falls back to a flat background.  Only used when
       ``ENABLE_IMAGE_LAYOUT`` is on.

   * - ``DISABLE_ENTERPRISE_LOGIN``
     - Disables the enterprise login flow.  Bundled as ``true``; set it to
       ``false`` to offer enterprise login.

   * - ``ENABLE_AUTO_GENERATED_USERNAME``
     - Generates the username from the registration form rather than asking for
       one.

   * - ``ENABLE_DYNAMIC_REGISTRATION_FIELDS``
     - Enables configurable registration fields.  Must be enabled to show any
       registration field besides the defaults (name, email, username,
       password).

   * - ``ENABLE_IMAGE_LAYOUT``
     - Allows images in the base container layout.  See `Modifying base
       container <docs/how_tos/modifying_base_container.rst>`_.

   * - ``ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN``
     - Enables progressive profiling.  If enabled, users are redirected to a
       second page where data for optional registration fields is collected.

   * - ``INFO_EMAIL``
     - Support address offered on the forgot-password page.  The sentence
       offering it is omitted when unset.

   * - ``LOGIN_ISSUE_SUPPORT_LINK``
     - Support page linked from the forgot-password form.  Not rendered when
       unset.

   * - ``LOGO_URL``, ``LOGO_WHITE_URL``
     - The site logo, in its regular and light-on-dark forms.  Both are bundled
       with the same default frontend-base uses for the shell header.

   * - ``MARKETING_SITE_BASE_URL``
     - Marketing site the logo links to.  The logo renders unlinked when unset.

   * - ``PASSWORD_RESET_SUPPORT_LINK``
     - Support page linked from the password-reset confirmation.  Unset, the
       message names support as plain text rather than a link.

   * - ``POST_REGISTRATION_REDIRECT_URL``
     - Where to send a user after registration, sent to the host page in the
       embedded-registration flow.

   * - ``PRIVACY_POLICY``, ``TOS_LINK``, ``TOS_AND_HONOR_CODE``
     - Destinations for the privacy-policy, terms-of-service and honor-code
       links on the registration form.  Each falls back to ``#`` when unset, so
       a site collecting agreement to them should set them.

   * - ``SEARCH_CATALOG_URL``
     - Where to send a learner who finishes progressive profiling with no
       ``nextUrl`` from the backend.  Falls back to the site itself.

   * - ``SESSION_COOKIE_DOMAIN``
     - Domain the cookies this app sets are scoped to.  Unset, they are scoped
       to the host that served the page.

   * - ``SHOW_REGISTRATION_LINKS``
     - Whether to show links to the registration page from the other pages.  Set
       it to ``false`` to hide them; they are shown otherwise.

   * - ``USER_RETENTION_COOKIE_NAME``
     - Name of the cookie set on successful registration.  No cookie is set when
       unset.

edX-specific Configuration
==========================

The following key enables an integration with a closed-source service private to
the edX organization, and might be unsupported in Open edX.

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Name
     - Description / Usage

   * - ``MARKETING_EMAILS_OPT_IN``
     - Enables opting in to marketing emails, to capture user consent for
       sending them.


*****
Slots
*****

This app offers slots for operators to customize its pages.  See `src/slots/`_
for the current list and per-slot READMEs with usage examples.

.. _src/slots/: ./src/slots/

**********
Developing
**********

Project Structure
=================

The layout follows the standard `frontend-base app layout`_:

- ``src/app.ts`` - the app definition imported by ``site.config.*.tsx``.
- ``src/constants.ts`` - the app's ``appId`` and route role identifiers.
- ``src/index.ts`` - the package's public exports (this is a library).
- ``src/routes.jsx`` - the app's react-router routes.
- ``src/Main.tsx`` - the root component for the app's routes.
- ``src/provides.ts`` - what the app provides to the shell; here, the roles that
  render its pages chromeless.
- ``src/slots/`` - the slots this app offers to consumers.
- ``src/style.scss`` and ``src/sass/`` - app-scoped runtime styles.

Everything else under ``src/`` is a feature directory, one per page or shared
concern, as described in `ADR 0002: feature based application organization
<docs/decisions/0002-feature-based-application-organization.rst>`_.

For more, see the `frontend-base migration how-to`_.

.. _frontend-base app layout: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md#src-file-structure
.. _frontend-base migration how-to: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md

Build Process Notes
===================

**Library build**

``npm run build`` compiles the library into ``dist/`` via ``tsc`` and
``tsc-alias``, and copies the SCSS across.  This is what gets published and
consumed by sites.

**CI build**

``npm run build:ci`` runs ``openedx build`` against ``site.config.ci.tsx`` so
webpack traverses the full app graph.  This catches issues, such as broken
lazy-loaded imports, that ``tsc`` and Jest would not surface.

Internationalization
====================

Please refer to the `frontend-base i18n howto`_ for documentation on
internationalization.

.. _frontend-base i18n howto: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst

************
Getting Help
************

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack invitation`_,
then join our `community Slack workspace`_.  Because this is a frontend
repository, the best place to discuss it would be in the `#wg-frontend channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-authn/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/getting-help

*******
License
*******

The code in this repository is licensed under the AGPLv3 unless otherwise noted.

Please see `LICENSE <LICENSE>`_ for details.

************
Contributing
************

Contributions are very welcome. Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes and
security fixes.

The PR description template should be applied automatically if you open the pull
request from the GitHub interface; otherwise you can find it at
`pull_request_template.md <.github/pull_request_template.md>`_.

****************************
The Open edX Code of Conduct
****************************

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

******
People
******

The assigned maintainers for this component and other project details may be
found in `Backstage`_. Backstage pulls this data from the ``catalog-info.yaml``
file in this repo.

.. _Backstage: https://backstage.openedx.org/catalog/default/component/frontend-app-authn

*************************
Reporting Security Issues
*************************

Please do not report security issues in public, and email security@openedx.org
instead.

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
