Enable Social Auth Locally
--------------------------

Please follow the steps below to enable social auth (SSO) locally.

1. Follow `Enabling Third Party Authentication <https://docs.openedx.org/en/latest/site_ops/install_configure_run_guide/configuration/tpa/index.html>`_ for backend configuration.

2. Authn has a component for rendering Social Auth providers at frontend which goes through each provider.

   * If the provider has an ``iconImage``, then it will be rendered as image in SSO button.

   * If ``iconImage`` is not available in provider, but the provider's ``iconClass`` is from the supported icon classes ``['apple', 'facebook', 'google', 'microsoft']`` then it is used as icon image.

   * If ``iconClass`` doesn't match the supported icon classes then the ``faSignInAlt`` from font awesome icons is used as icon image for SSO button.
