import React from 'react';

import { FormattedMessage } from '@edx/frontend-platform/i18n';

export default function SideDiscountBanner() {
  const getDiscountText = () => (
    <span className="text-accent-a h3">
      15% <FormattedMessage
        id="side.discount.message.15.off"
        defaultMessage="off"
        description="Text used with discounts e.g. 15% off"
      />
    </span>
  );
  const getCerificateMsg = () => (
    <span className="dicount-heading">
      <FormattedMessage
        id="certificate.message"
        defaultMessage="certificate* with code"
        description="Text with certificate"
      />
    </span>
  );
  return (
    <span className="mr-1.5">
      <FormattedMessage
        id="side.discount.message.body"
        defaultMessage="Get {discountText} your first verified {lineBreak} {certificateMsg}"
        description="Message body for edX discount"
        values={{
          discountText: getDiscountText(),
          lineBreak: <br />,
          certificateMsg: getCerificateMsg(),
        }}
      />
    </span>
  );
}
