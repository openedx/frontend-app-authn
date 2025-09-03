import React from "react";

import { getConfig } from "@edx/frontend-platform";
import { useIntl } from "@edx/frontend-platform/i18n";
import { Hyperlink, Image } from "@openedx/paragon";
import classNames from "classnames";

import messages from "./messages";

const MediumLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className="w-100" style={{ height: "4px", background: "linear-gradient(to right, #D32F2F, #B71C1C)" }} />
      <div className="w-100 p-0 mb-3 d-flex">
        <div className="col-md-10" style={{ background: "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)" }}>
          <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
            <Image alt={getConfig().SITE_NAME} className="logo" src={getConfig().LOGO_WHITE_URL} />
          </Hyperlink>
          <div className="d-flex align-items-center justify-content-center mb-4 px-4">
            <div className="text-center">
              <h1
                className="display-1 text-white font-weight-bold mt-5 mb-5"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
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
        <div className="col-md-2 bg-white p-0">
          <svg className="w-100 h-100" preserveAspectRatio="xMaxYMin meet" style={{ fill: "#FFCDD2" }}>
            <g transform="skewX(168)">
              <rect x="0" y="0" height="100%" width="100%" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
};

export default MediumLayout;
