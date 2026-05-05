# RegisterAdditionalFieldsSlot

### Slot ID

`org.openedx.frontend.authn.register.additional_fields.v1`

### Plugin Props

| Name           | Type                            | Description                                                       |
| -------------- | ------------------------------- | ----------------------------------------------------------------- |
| `formFields`   | `Record<string, string>`        | Current values of every field in the registration form.           |
| `setFormField` | `(event: ChangeEvent) => void`  | Form change handler — call with a synthetic event whose `target`  |
|                |                                 | has `name` and `value` to update form state.                      |

### Description

Renders just above the **Create Account** submit button. Use this slot
to append optional fields whose values should travel with the standard
registration POST. The plugin component is responsible for its own
layout but should match Paragon form spacing for visual consistency.

Fields written via `setFormField` are submitted as part of `request.POST`
to the LMS registration view alongside the built-in fields.

### Example usage

```jsx
import { Form } from '@openedx/paragon';

const DemographicsFields = ({ formFields, setFormField }) => (
  <>
    <Form.Group>
      <Form.Control
        name="pronouns"
        floatingLabel="Pronouns (optional)"
        value={formFields.pronouns || ''}
        onChange={setFormField}
      />
    </Form.Group>
    <Form.Group>
      <Form.Control
        as="select"
        name="department"
        floatingLabel="Department (optional)"
        value={formFields.department || ''}
        onChange={setFormField}
      >
        <option value="">—</option>
        <option value="eng">Engineering</option>
        <option value="ops">Operations</option>
        <option value="edu">Education</option>
      </Form.Control>
    </Form.Group>
  </>
);
```

The companion backend plugin
(`openedx-registration-demographics-plugin`) validates these fields via
the `StudentRegistrationRequested` filter and persists them on receipt
