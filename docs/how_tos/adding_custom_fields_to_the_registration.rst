======================================================
Adding Custom Fields to the Registration Page in Authn
======================================================

Introduction
------------
This guide explains how to add custom fields to the registration page of your Open edX instance. To integrate custom fields with the new Authn MFE, additional configuration steps are required. Custom fields can be either required—added directly to the registration page—or optional, and will be added to a secondary registration page that users can skip.

Configuring Custom Registration Fields on the Back-End
------------------------------------------------------
To configure dynamic registration fields within Authn, perform the following steps in Open edX LMS settings or your custom form plugin:

#. **Install your custom form app and configure it in LMS**

   Follow the steps outlined in the official Open edX documentation to configure custom registration fields for your instance:
   `Customize the Registration Page <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/configuration/customize_registration_page.html>`_.

#. **Enable Dynamic Registration Fields Setting in Open edX**

   Enable the `ENABLE_DYNAMIC_REGISTRATION_FIELDS` setting in the settings file. This setting should be added in the plugin where the extension form is placed.

   .. note:: See the context view for the Logistration page: `user_authn API Context View <https://github.com/openedx/edx-platform/blob/master/openedx/core/djangoapps/user_authn/api/views.py#L61>`_.


#. **Add Fields to the Extended Profile Fields List**

   Add your custom field to the `extended_profile_fields` list to ensure it is checked correctly during registration.

   .. warning:: If this step is missed, fields from the extension form will not be added. For more information, please see the condition in: `helper.py <https://github.com/openedx/edx-platform/blob/master/openedx/core/djangoapps/user_authn/api/helper.py#L97>`_.


After adding all required settings, verify that the context has been properly extended with the new fields by inspecting the networks tab in your browser's developer tools.

Configuring Dynamic Registration Fields in Authn
------------------------------------------------

#. **Enable Dynamic Fields in the MFE**

   Ensure that `ENABLE_DYNAMIC_REGISTRATION_FIELDS` is enabled for the MFE. This can be configured via env tokens or through site configurations if MFE CONFIG API is enabled.

Following these steps should help you integrate custom fields into the Authn MFE for Open edX.
