import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const RegisterAdditionalFieldsSlot = ({ formFields, setFormField }) => (
  <PluginSlot
    id="org.openedx.frontend.authn.register.additional_fields.v1"
    pluginProps={{ formFields, setFormField }}
  />
);

RegisterAdditionalFieldsSlot.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  formFields: PropTypes.object.isRequired,
  setFormField: PropTypes.func.isRequired,
};

