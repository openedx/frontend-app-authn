======================================================
Adding Custom Fields to the Registration Page in Authn
======================================================

Introduction
------------
This guide explains how to add custom fields to the registration page of your Open edX instance. To integrate custom fields with the new Authn MFE, additional configuration steps are required. Custom fields can be either required—added directly to the registration page—or optional, and will be added to the progressive profiling page (welcome page) that users can skip.

Two main ways to add additional fields depending on the type of fields you want
------------
Open edX platform has default additional fields which can be used in Authn MFE. The fields that are in `EXTRA_FIELDS <https://github.com/openedx/edx-platform/blob/a9355852edede9662762847e0d168663083fc816/openedx/core/djangoapps/user_authn/api/helper.py#L20-L39>`_ are already exists as column in user profile model, but are disbaled, so when adding other field that don't exits, a step to do data migration is required.

In order to add fields that already exist in the user model, it is enough to redefine several constants. How to do this will be described in instructions **A**. If you need to add fields that are not in the user model by default, then you need to use instruction **B**.

**A. Add fields that are already exists as column in user profile model**
-----------------
You need to redefine several constants in the settings. Several methods can be used for this:

#. **Redefine constants using Django admin and `Site configurations` API. (recommended):**
    - Go to `Site configurations` in admin: {{LMS}}/admin/site_configuration/siteconfiguration/
    - Add new settings to OrderedDict (create new `Site configurations` if it wasn't before):
    .. code-block:: json
    {
        "ENABLE_DYNAMIC_REGISTRATION_FIELDS": "true",
        "MFE_CONFIG": {
            "ENABLE_DYNAMIC_REGISTRATION_FIELDS": "true"
        },
        "REGISTRATION_EXTRA_FIELDS": {
            "country": "required",
            "gender": "required"
        }
    }
    
    - All possible fields can be find in `EXTRA_FIELDS <https://github.com/openedx/edx-platform/blob/a9355852edede9662762847e0d168663083fc816/openedx/core/djangoapps/user_authn/api/helper.py#L20-L39>`_.
    - REST API gets cached, if you are in hurry though you can do this command: `tutor local exec redis redis-cli flushall`.
    - Or you can wait a few minutes until the cache is invalidated.
    - After this, the new fields should appear on the Auth page.
    
#. **Also it is possible to redefine settings above with using the Tutor plugin:**
    - There is tutorial `how Tutor plugin can be created <https://docs.tutor.edly.io/tutorials/plugin.html#creating-a-tutor-plugin>`_.
    - Settings above should be overriden in the Tutor plugin.
    
#. **For the local development or testing settings can be overriden in configuration files:**
    - For example, constants can be added here: `env/apps/openedx/settings/lms/development.py`:
    .. code-block:: python
    ENABLE_DYNAMIC_REGISTRATION_FIELDS = "true"
    
    MFE_CONFIG["ENABLE_DYNAMIC_REGISTRATION_FIELDS"] = "true"
    
    REGISTRATION_EXTRA_FIELDS["country"] = "required"
    
    REGISTRATION_EXTRA_FIELDS["gender"] = "required"
    
`In total, you must redefine 3 constants using the method that is most preferable for you:` **ENABLE_DYNAMIC_REGISTRATION_FIELD = True, MFE_CONFIG["ENABLE_DYNAMIC_REGISTRATION_FIELDS"] = True, REGISTRATION_EXTRA_FIELDS["field_name"] = "required/optionl/hidden"**.
    
    
**B. Add fields that do not exist in the user profile model**
---------------------------

Everything said above in instructions “**A**” is also relevant for adding fields that do not exist in the user profile model. This is a more complex task and requires a basic understanding of Open EdX, the concept of plugins, as well as knowledge of the Django framework However, from the additional actions that will need to be performed:
    - Extend user profile model with new fields. An external plugin can be used for this (recommended). Also user profile model can be expanded inside edx-platform code base (not recommended). `New fields must be migrated to the database.`
    - Create form with additional user profile fields and pass path to this form into `settings`. The form also can be created in the Open edX plugin. `Edx-cookiecutters <https://github.com/openedx/edx-cookiecutters>`_ can be used for the plugin creation.
    - Additional setting can be passed via `Site configurations` in LMS admin. This is described in instructions “**A**”.
    Example:
    
        .. code-block:: json
        
        {
            "REGISTRATION_EXTENSION_FORM" = "you_application.form.ExtendedUserProfileForm",
            
            "extended_profile_fields": [
            "your_new_field_id",
            "subscribe_to_emails",
            "confirm_age_consent",
            "something_else"
            ]
        }
        
`In total, you must migrate to DB new user profile fields and redefine 3 constants using the method that is most preferable for you:` **ENABLE_DYNAMIC_REGISTRATION_FIELD = True, MFE_CONFIG["ENABLE_DYNAMIC_REGISTRATION_FIELDS"] = True,  REGISTRATION_EXTENSION_FORM = "you_application.form.ExtendedUserProfileForm"**.

**Below you can read in detail how can you create new Application, Form, what happens when you redefine each of the constants and how they can be redefined.**
    

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

   Add your `custom field <https://edx.readthedocs.io/projects/edx-installing-configuring-and-running/en/latest/configuration/retrieve_extended_profile_metadata.html>`_ to the `extended_profile_fields` list to ensure it is checked correctly during registration.

   .. warning:: If this step is missed, fields from the extension form will not be added. For more information, please see the condition in: `helper.py <https://github.com/openedx/edx-platform/blob/master/openedx/core/djangoapps/user_authn/api/helper.py#L97>`_.


After adding all required settings, verify that the context has been properly extended with the new fields by inspecting the networks tab in your browser's developer tools.

Configuring Dynamic Registration Fields in Authn
------------------------------------------------

#. **Enable Dynamic Fields in the MFE**

   Ensure that `ENABLE_DYNAMIC_REGISTRATION_FIELDS` is enabled for the MFE. This can be configured via env tokens or through site configurations if MFE CONFIG API is enabled.

Following these steps should help you integrate custom fields into the Authn MFE for Open edX.