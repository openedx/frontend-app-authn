import React, { useState } from 'react';

import ClipboardJS from 'clipboard';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { faCut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { PageBanner } from '@edx/paragon';

export default function DiscountExperimentBanner() {
  const [show, setShow] = useState(true);
  new ClipboardJS('.copyIcon'); // eslint-disable-line no-new

  return (
    <>
      <PageBanner
        show={show}
        dismissible
        onDismiss={() => { setShow(false); }}
      >
        <span className="text-primary-700 small variation2-text-alignment">
          <span className="mr-1">
            <FormattedMessage
              id="discount.message.body"
              defaultMessage="Get {discount} your first verified certificate* with code"
              description="Message body for edX discount"
              values={{
                discount: <strong> 15% off </strong>,
              }}
            />
          </span>
          <span className="dashed-border p-1 d-inline-flex flex-wrap align-items-center">
            <span id="edx-welcome" className="font-weight-bold">EDXWELCOME</span>
            <FontAwesomeIcon
              className="text-dark-200 copyIcon ml-2"
              icon={faCut}
              data-clipboard-action="copy"
              data-clipboard-target="#edx-welcome"
            />
          </span>
        </span>
      </PageBanner>
    </>
  );
}
