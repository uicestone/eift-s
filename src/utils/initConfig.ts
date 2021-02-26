import ConfigModel, { Config } from "../models/Config";
import reduceConfig from "./reduceConfig";

const { DEBUG } = process.env;

export default async (config: Config): Promise<void> => {
  const existingConfig = reduceConfig(await ConfigModel.find());
  const initConfigItemsInsert = (Object.keys(initConfig) as Array<keyof Config>)
    .filter((key) => existingConfig[key] === undefined)
    .map((initKey) => ({ [initKey]: initConfig[initKey] }));
  if (initConfigItemsInsert.length) {
    await ConfigModel.insertMany(initConfigItemsInsert);
    console.log(
      `[CFG] ${initConfigItemsInsert.length} config items initialized.`
    );
  }
  Object.assign(config, ...initConfigItemsInsert, existingConfig);
  if (!DEBUG) {
    console.log("[CFG] Loaded:", JSON.stringify(config));
  }
};

const initConfig: Config = {};
