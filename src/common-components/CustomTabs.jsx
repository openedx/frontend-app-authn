import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const CustomTabs = ({ activeKey, onSelect, children, className }) => {
  return (
    <div className={classNames("custom-tabs", className)}>
      <ul className="custom-nav-tabs" role="tablist">
        {React.Children.map(children, (child, index) => {
          if (!child) return null;

          const { eventKey, title } = child.props;
          const isActive = eventKey === activeKey;

          return (
            <li className="custom-nav-item" key={eventKey || index}>
              <button
                className={classNames("custom-nav-link", { active: isActive })}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect && onSelect(eventKey)}
              >
                {title}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="custom-tab-content">
        {React.Children.map(children, (child) => {
          if (!child) return null;

          const { eventKey } = child.props;
          const isActive = eventKey === activeKey;

          if (isActive) {
            return (
              <div className="custom-tab-pane active" role="tabpanel">
                {child.props.children}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

const CustomTab = ({ children }) => {
  return <>{children}</>;
};

CustomTabs.propTypes = {
  activeKey: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CustomTab.propTypes = {
  eventKey: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
};

export { CustomTabs, CustomTab };
