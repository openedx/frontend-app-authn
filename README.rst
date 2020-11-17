|Build Status| |Codecov| |license|

frontend-app-logistration
=================================

This is a micro-frontend application responsible for the login, registration and password reset functionality.

Development
-----------

Start Devstack
^^^^^^^^^^^^^^

To use this application `devstack <https://github.com/edx/devstack>`__ must be running.

-  Start devstack

Start the development server
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In this project, install requirements and start the development server by running:

.. code:: bash

   npm install
   npm start # The server will run on port 1999

Once the dev server is up visit http://localhost:1999/login.

Configuration and Deployment
----------------------------

This MFE is configured via node environment variables supplied at build time. See the .env file for the list of required environment variables. Example build syntax with a single environment variable:

.. code:: bash

   NODE_ENV=development ACCESS_TOKEN_COOKIE_NAME='edx-jwt-cookie-header-payload' npm run build


For more information see the document: `Micro-frontend applications in Open
edX <https://github.com/edx/edx-developer-docs/blob/5191e800bf16cf42f25c58c58f983bdaf7f9305d/docs/micro-frontends-in-open-edx.rst>`__.

.. |Build Status| image:: https://api.travis-ci.org/edx/frontend-app-logistration.svg?branch=master
   :target: https://travis-ci.org/edx/frontend-app-logistration
.. |Codecov| image:: https://img.shields.io/codecov/c/github/edx/frontend-app-logistration
   :target: https://codecov.io/gh/edx/frontend-app-logistration
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-logistration.svg
   :target: @edx/frontend-app-logistration