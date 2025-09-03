import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Hyperlink, Image } from "@openedx/paragon";
import PropTypes from "prop-types";

import messages from "./messages";

const LargeLayout = ({ fullName }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="w-50 d-flex">
      <div className="col-md-10 p-0" style={{ background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" }}>
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo position-absolute" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="min-vh-100 d-flex align-items-center justify-content-center px-4">
          <div>
            <h1
              className="text-white display-3 font-weight-bold mb-3 data-hj-suppress"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
            >
              {formatMessage(messages["welcome.to.platform"], { siteName: getConfig().SITE_NAME, fullName })}
            </h1>
            <h2 className="text-white h4 mb-0" style={{ opacity: 0.9 }}>
              {formatMessage(messages["complete.your.profile.1"])}
              <div className="text-white mt-2" style={{ color: "#FFCDD2" }}>
                {formatMessage(messages["complete.your.profile.2"])}
              </div>
            </h2>
          </div>
        </div>
      </div>
      <div className="col-md-2 bg-white p-0">
        <svg className="ml-n1 w-100 h-100" preserveAspectRatio="xMaxYMin meet" style={{ fill: "#FFCDD2" }}>
          <g transform="skewX(171.6)">
            <rect x="0" y="0" height="100%" width="100%" />
          </g>
        </svg>
      </div>
    </div>
  );
};

LargeLayout.propTypes = {
  fullName: PropTypes.string.isRequired,
};

export default LargeLayout;
