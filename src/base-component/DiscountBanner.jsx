import React, { useState } from 'react';

import ClipboardJS from 'clipboard';

import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { faCut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Toast, PageBanner } from '@edx/paragon';
import messages from './messages';

const DiscountExperimentBanner = (props) => {
  const { intl } = props;
  const [show, setShow] = useState(true);
  const [showToast, setToastShow] = useState(false);
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new
  const getDiscountText = () => (
    <strong>
      15% <FormattedMessage
        id="top.discount.message.15.off"
        defaultMessage="off"
        description="Text used with discounts e.g. 15% off"
      />
    </strong>
  );

  return (
    <>
      <Toast
        onClose={() => setToastShow(false)}
        show={showToast}
      >
        {intl.formatMessage(messages['code.copied'])}
      </Toast>
      <PageBanner
        show={show}
        dismissible
        onDismiss={() => { setShow(false); }}
      >
        <span className="text-primary-700 small variation2-text-alignment">
          <span className="mr-3">
            <FormattedMessage
              id="top.discount.message.body"
              defaultMessage="Get {discount} your first verified certificate* with code"
              description="Message body for edX discount"
              values={{
                discount: getDiscountText(),
              }}
            />
          </span>
          <span className="hover-text dashed-border p-1 d-inline-flex flex-wrap align-items-center">
            <span id="edx-welcome" className="font-weight-bold ">EDXWELCOME</span>
            <FontAwesomeIcon
              className="text-dark-200 copyIcon ml-2 hover-icon"
              icon={faCut}
              data-clipboard-action="copy"
              data-clipboard-target="#edx-welcome"
              onClick={() => setToastShow(true)}
            />
          </span>
        </span>
      </PageBanner>
    </>
  );
};

DiscountExperimentBanner.propTypes = {
  intl: intlShape.isRequired,

};
export default injectIntl(DiscountExperimentBanner);
