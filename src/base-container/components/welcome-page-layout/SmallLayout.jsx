import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Hyperlink, Image } from "@openedx/paragon";
import PropTypes from "prop-types";

import messages from "./messages";

const SmallLayout = ({ fullName }) => {
  const { formatMessage } = useIntl();

  return (
    <div className="min-vw-100" style={{ background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" }}>
      <div className="col-md-12" style={{ height: "4px", background: "linear-gradient(to right, #B71C1C, #D32F2F)" }} />
      <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
        <Image className="logo-small" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
      </Hyperlink>
      <div className="d-flex align-items-center m-3.5 px-3">
        <div>
          <h1
            className="h5 text-white font-weight-bold data-hj-suppress"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
          >
            {formatMessage(messages["welcome.to.platform"], { siteName: getConfig().SITE_NAME, fullName })}
          </h1>
          <h2 className="h6 text-white mt-3" style={{ opacity: 0.9 }}>
            {formatMessage(messages["complete.your.profile.1"])}
            <div className="text-white mt-2" style={{ color: "#FFCDD2" }}>
              {formatMessage(messages["complete.your.profile.2"])}
            </div>
          </h2>
        </div>
      </div>
    </div>
  );
};

SmallLayout.propTypes = {
  fullName: PropTypes.string.isRequired,
};

export default SmallLayout;
