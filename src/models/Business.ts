import { prop, getModelForClass } from "@typegoose/typegoose";
import { Entity } from "./Entity";

export class Business extends Entity {}

const BusinessModel = getModelForClass(Business, {
  schemaOptions: {
    toJSON: {
      getters: true,
      transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
      },
    },
  },
});

export default BusinessModel;
