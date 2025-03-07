import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from '../../messages';

const TermsOfService = (props) => {
  const { formatMessage } = useIntl();
  const {
    errorMessage, onChangeHandler, value,
  } = props;

  return (
    <div id="terms-of-service" className="micro text-muted">
      <Form.Checkbox
        className="form-field--checkbox mt-1"
        id="tos"
        checked={value}
        name="terms_of_service"
        value={value}
        onChange={onChangeHandler}
      >
        <FormattedMessage
          id="register.page.terms.of.service"
          defaultMessage="I agree to the {platformName}&nbsp;{termsOfService}"
          description="Text that appears on registration form stating terms of service.
                       It is a legal document that users must agree to."
          values={{
            platformName: getConfig().SITE_NAME,
            termsOfService: (
              <Hyperlink variant="muted" destination={getConfig().TOS_LINK || '#'} target="_blank">
                {formatMessage(messages['terms.of.service'])}
              </Hyperlink>
            ),
          }}
        />
      </Form.Checkbox>
      {errorMessage && (
        <Form.Control.Feedback type="invalid" className="form-text-size" hasIcon={false}>
          {errorMessage}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

TermsOfService.defaultProps = {
  errorMessage: '',
  value: false,
};

TermsOfService.propTypes = {
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func.isRequired,
  value: PropTypes.bool,
};

export default TermsOfService;
