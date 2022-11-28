|Build Status| |ci-badge| |Codecov| |license| |semantic-release| |npm_version|

frontend-app-authn
====================

Please tag **@openedx/vanguards** on any PRs or issues.  Thanks!

Introduction
------------

This is a micro-frontend application responsible for the login, registration and password reset functionality.

**What is the domain of this MFE?**

- Register page

- Login page

- Forgot password page

- Reset password page

- Progressive profiling page


Installation
------------

This MFE is bundled with `Devstack <https://github.com/openedx/devstack>`_, see the `Getting Started <https://github.com/openedx/devstack#getting-started>`_ section for setup instructions.

1. Install Devstack using the `Getting Started <https://github.com/openedx/devstack#getting-started>`_ instructions.

2. Start up LMS, if it's not already started.

4. Within this project (frontend-app-authn), install requirements and start the development server:

   .. code-block::

      npm install
      npm start # The server will run on port 1999

5. Once the dev server is up, visit http://localhost:1999 to access the MFE

   * Note: Social Sign-on Buttons (SSO) will not be available until configured locally.

   .. image:: ./docs/images/frontend-app-authn-localhost-preview.png

Environment Variables/Setup Notes
---------------------------------

This MFE is configured via environment variables supplied at build time.  All micro-frontends have a shared set of required environment variables, as documented in the Open edX Developer Guide under `Required Environment Variables <https://edx.readthedocs.io/projects/edx-developer-docs/en/latest/developers_guide/micro_frontends_in_open_edx.html#required-environment-variables>`__.

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

   * - ``WELCOME_PAGE_SUPPORT_LINK``
     - The fully-qualified URL to the welcome support page in the target environment.
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

   * - ``ENABLE_PROGRESSIVE_PROFILING``
     - Enables support for progressive profiling. If enabled, users are redirected to a second page where data for optional registration fields can be collected.
     - ``true`` | ``''`` (empty strings are falsy)

   * - ``DISABLE_ENTERPRISE_LOGIN``
     - Disables the enterprise login from Authn MFE.
     - ``true`` | ``''`` (empty strings are falsy)

edX-specific Environment Variables
**********************************

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

For more information see the document: `Micro-frontend applications in Open
edX <https://edx.readthedocs.io/projects/edx-developer-docs/en/latest/developers_guide/micro_frontends_in_open_edx.html#required-environment-variables>`__.

Known Issues
------------

None


==============================

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-authn.svg?branch=master
   :target: https://travis-ci.com/edx/frontend-app-authn
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-app-authn
   :target: https://codecov.io/gh/edx/frontend-app-authn
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-authn.svg
   :target: @edx/frontend-app-authn
.. |ci-badge| image:: https://github.com/openedx/edx-developer-docs/actions/workflows/ci.yml/badge.svg
   :target: https://github.com/openedx/edx-developer-docs/actions/workflows/ci.yml
   :alt: Continuous Integration
.. |npm_version| image:: https://img.shields.io/npm/v/@edx/frontend-app-authn.svg
   :target: @edx/frontend-app-authn
.. |npm_downloads| image:: https://img.shields.io/npm/dt/@edx/frontend-app-authn.svg
   :target: @edx/frontend-app-authn
.. |semantic-release| image:: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
   :target: https://github.com/semantic-release/semantic-release