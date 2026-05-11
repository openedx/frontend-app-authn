import { DemographicsFields } from "@openedx/openedx-demographics-plugin";
import {
  DIRECT_PLUGIN,
  PLUGIN_OPERATIONS,
} from "@openedx/frontend-plugin-framework";

function addPlugins(config, slot_name, plugins) {
  if (slot_name in config.pluginSlots === false) {
    config.pluginSlots[slot_name] = {
      keepDefault: true,
      plugins: [],
    };
  }

  config.pluginSlots[slot_name].plugins.push(...plugins);
}

async function setConfig() {
  let config = {
    pluginSlots: {},
  };

  try {
    addPlugins(config, "org.openedx.frontend.authn.register.additional_fields.v1", [
      {
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: "demographics_fields",
          type: DIRECT_PLUGIN,
          priority: 50,
          RenderWidget: DemographicsFields,
        },
      },
    ]);
  } catch (err) {
    console.error("env.config.jsx failed to apply: ", err);
  }

  // eslint-disable-next-line no-console
  console.log("[env.config] setConfig returning:", JSON.stringify(config, null, 2));
  return config;
}

export default setConfig;
