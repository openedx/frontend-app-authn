import React, { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';

import messages from '../../messages';

const HonorCode = (props) => {
  const { formatMessage } = useIntl();
  const {
    errorMessage, onChangeHandler, fieldType, value,
  } = props;

  useEffect(() => {
    if (fieldType === 'tos_and_honor_code' && !value) {
      onChangeHandler({ target: { name: 'honor_code', value: true } });
    }
  }, [fieldType, onChangeHandler, value]);

  if (fieldType === 'tos_and_honor_code') {
    return (
      <div id="honor-code" className="micro text-muted mt-4">
        <FormattedMessage
          id="register.page.terms.of.service.and.honor.code"
          defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                Member process your personal data in accordance with the {privacyPolicy}."
          description="Text that appears on registration form stating honor code and privacy policy"
          values={{
            platformName: getConfig().SITE_NAME,
            tosAndHonorCode: (
              <Hyperlink
                className="inline-link"
                destination={getConfig().TOS_AND_HONOR_CODE || '#'}
                target="_blank"
                showLaunchIcon={false}
              >
                {formatMessage(messages['terms.of.service.and.honor.code'])}
              </Hyperlink>
            ),
            privacyPolicy: (
              <Hyperlink
                className="inline-link"
                destination={getConfig().PRIVACY_POLICY || '#'}
                target="_blank"
                showLaunchIcon={false}
              >
                {formatMessage(messages['privacy.policy'])}
              </Hyperlink>
            ),
          }}
        />
      </div>
    );
  }

  return (
    <div id="honor-code" className="micro text-muted">
      <Form.Checkbox
        className="form-field--checkbox mt-1"
        id="honor-code"
        checked={value}
        name="honor_code"
        value={value}
        onChange={onChangeHandler}
      >
        <FormattedMessage
          id="register.page.honor.code"
          defaultMessage="I agree to the {platformName}&nbsp;{tosAndHonorCode}"
          description="Text that appears on registration form stating honor code"
          values={{
            platformName: getConfig().SITE_NAME,
            tosAndHonorCode: (
              <Hyperlink variant="muted" destination={getConfig().TOS_AND_HONOR_CODE || '#'} target="_blank">
                {formatMessage(messages['honor.code'])}
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

HonorCode.defaultProps = {
  errorMessage: '',
  onChangeHandler: null,
  fieldType: 'honor_code',
  value: false,
};

HonorCode.propTypes = {
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func,
  fieldType: PropTypes.string,
  value: PropTypes.bool,
};

export default HonorCode;
