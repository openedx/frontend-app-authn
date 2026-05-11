import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const RegisterAdditionalFieldsSlot = ({ formFields, setFormField }) => {
  // eslint-disable-next-line no-console
  console.log('[RegisterAdditionalFieldsSlot] rendering, formFields keys:', Object.keys(formFields));
  return (
    <PluginSlot
      id="org.openedx.frontend.authn.register.additional_fields.v1"
      pluginProps={{ formFields, setFormField }}
    />
  );
}

RegisterAdditionalFieldsSlot.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  formFields: PropTypes.object.isRequired,
  setFormField: PropTypes.func.isRequired,
};

export default RegisterAdditionalFieldsSlot;

