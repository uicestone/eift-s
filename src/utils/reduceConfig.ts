import { Config, ConfigDocument } from "../models/Config";
import { DocumentType } from "@typegoose/typegoose";

export default (items: DocumentType<ConfigDocument>[]): Config => {
  return items.reduce((acc, cur) => {
    const curObj = cur.toObject();
    ["_id", "__v", "createdAt", "updatedAt"].forEach((k) => {
      delete curObj[k];
    });
    return Object.assign(acc, curObj);
  }, new Config());
};
