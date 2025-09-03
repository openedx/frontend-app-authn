import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Hyperlink, Image } from "@openedx/paragon";
import classNames from "classnames";

import messages from "./messages";

const SmallLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <span className="w-100" style={{ background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" }}>
      <div className="col-md-12" style={{ height: "4px", background: "linear-gradient(to right, #B71C1C, #D32F2F)" }} />
      <div>
        <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
          <Image className="logo-small" alt={getConfig().SITE_NAME} src={getConfig().LOGO_WHITE_URL} />
        </Hyperlink>
        <div className="d-flex align-items-center m-3.5 px-3">
          <div className="text-center w-100">
            <h1
              className="text-white mt-3.5 mb-3.5 font-weight-bold"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              <span>
                {formatMessage(messages["start.learning"])}{" "}
                <span className="text-white d-inline-block mt-2" style={{ color: "#FFCDD2" }}>
                  {formatMessage(messages["with.site.name"], { siteName: getConfig().SITE_NAME })}
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>
    </span>
  );
};

export default SmallLayout;
