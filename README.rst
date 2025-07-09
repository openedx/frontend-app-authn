##################
frontend-app-authn
##################

|Build Status| |ci-badge| |Codecov| |semantic-release|

********
Purpose
********

This is a micro-frontend application responsible for the login, registration and password reset functionality.

**What is the domain of this MFE?**

- Register page

- Login page

- Forgot password page

- Reset password page

- Progressive profiling page

***************
Getting Started
***************

Installation
============

`Tutor`_ is currently recommended as a development environment for your new MFE. Please refer to the `relevant tutor-mfe documentation`_ to get started using it.

.. _Tutor: https://github.com/overhangio/tutor
.. _relevant tutor-mfe documentation: https://github.com/overhangio/tutor-mfe?tab=readme-ov-file#mfe-development

Devstack (Deprecated) instructions
==================================

1. Install Devstack using the `Getting Started <https://github.com/openedx/devstack#getting-started>`_ instructions.

2. Start up LMS, if it's not already started.

4. Within this project (frontend-app-authn), install requirements and start the development server:

   .. code-block::

      npm install
      npm start # The server will run on port 1999

5. Once the dev server is up, visit http://localhost:1999 to access the MFE

   .. image:: ./docs/images/frontend-app-authn-localhost-preview.png

   **Note:** Follow `Enable social auth locally <docs/how_tos/enable_social_auth.rst>`_ for enabling Social Sign-on Buttons (SSO) locally

Environment Variables/Setup Notes
=================================

This MFE is configured via environment variables supplied at build time.  All micro-frontends have a shared set of required environment variables, as documented in the Open edX Developer Guide under `Required Environment Variables <https://github.com/overhangio/tutor-mfe?tab=readme-ov-file#mfe-development>`__.

The authentication micro-frontend also requires the following additional variable:

.. list-table:: Environment Variables
   :widths: 30 50 20
   :header-rows: 1

   * - Name
     - Description / Usage
     - Example

   * - ``LOGIN_ISSUE_SUPPORT_LINK``
     - The fully-qualified URL to the login issue support page in the target environment.
     - ``https://support.example.com``

   * - ``ACTIVATION_EMAIL_SUPPORT_LINK``
     - The fully-qualified URL to the activation email support page in the target environment.
     - ``https://support.example.com``

   * - ``PASSWORD_RESET_SUPPORT_LINK``
     - The fully-qualified URL to the password reset support page in the target environment.
     - ``https://support.example.com``

   * - ``AUTHN_PROGRESSIVE_PROFILING_SUPPORT_LINK``
     - The fully-qualified URL to the progressive profiling support page in the target environment.
     - ``https://support.example.com``

   * - ``TOS_AND_HONOR_CODE``
     - The fully-qualified URL to the Honor code page in the target environment.
     - ``https://example.com/honor``

   * - ``TOS_LINK``
     - The fully-qualified URL to the Terms of service page in the target environment.
     - ``https://example.com/tos``

   * - ``PRIVACY_POLICY``
     - The fully-qualified URL to the Privacy policy page in the target environment.
     - ``https://example.com/privacy``

   * - ``INFO_EMAIL``
     - The valid email address for information query regarding the target environment.
     - ``info@example.com``

   * - ``ENABLE_DYNAMIC_REGISTRATION_FIELDS``
     - Enables support for configurable registration fields on the MFE. This flag must be enabled to show any required registration field besides the default fields (name, email, username, password).
     - ``true`` | ``''`` (empty strings are falsy)

   * - ``ENABLE_PROGRESSIVE_PROFILING_ON_AUTHN``
     - Enables support for progressive profiling. If enabled, users are redirected to a second page where data for optional registration fields can be collected.
     - ``true`` | ``''`` (empty strings are falsy)

   * - ``DISABLE_ENTERPRISE_LOGIN``
     - Disables the enterprise login from Authn MFE.
     - ``true`` | ``''`` (empty strings are falsy)

   * - ``MFE_CONFIG_API_URL``
     - Link of the API to get runtime mfe configuration variables from the site configuration or django settings.
     - ``/api/v1/mfe_config`` | ``''`` (empty strings are falsy)  

   * - ``APP_ID``
     - Name of MFE, this will be used by the API to get runtime configurations for the specific micro frontend. For a frontend repo `frontend-app-appName`, use `appName` as APP_ID.
     - ``authn`` | ``''``

   * - ``ENABLE_IMAGE_LAYOUT``
     - Enables the image layout feature within the authn. When set to True, this feature allows the inclusion of images in the base container layout. For more details on configuring this feature, please refer to the `Modifying base container <docs/how_tos/modifying_base_container.rst>`_.
     - ``true`` | ``''`` (empty strings are falsy)


edX-specific Environment Variables
==================================

Furthermore, there are several edX-specific environment variables that enable integrations with closed-source services private to the edX organization, and might be unsupported in Open edX.

.. list-table:: edX-specific Environment Variables
   :widths: 30 50 20
   :header-rows: 1

   * - Name
     - Description / Usage
     - Example

   * - ``MARKETING_EMAILS_OPT_IN``
     - Enables support for opting in marketing emails that helps us getting user consent for sending marketing emails.
     - ``true`` | ``''`` (empty strings are falsy)

   * - ``SHOW_CONFIGURABLE_EDX_FIELDS``
     - For edX, country and honor code fields are required by default. This flag enables edX specific required fields.
     - ``true`` | ``''`` (empty strings are falsy)    

For more information see the document: `Micro-frontend applications in Open
edX <https://github.com/overhangio/tutor-mfe?tab=readme-ov-file#mfe-development>`__.

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

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-authn.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-app-authn
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-app-authn
   :target: https://codecov.io/gh/edx/frontend-app-authn
.. |ci-badge| image:: https://github.com/openedx/edx-developer-docs/actions/workflows/ci.yml/badge.svg
   :target: https://github.com/openedx/edx-developer-docs/actions/workflows/ci.yml
   :alt: Continuous Integration
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release