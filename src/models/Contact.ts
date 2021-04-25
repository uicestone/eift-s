import { prop, plugin, getModelForClass } from "@typegoose/typegoose";
import { Schema } from "mongoose";
import updateTimes from "./plugins/updateTimes";

class ContactDetail {
  @prop({ required: true })
  type!: "fixed" | "mobile" | "email";

  @prop()
  scene?: string;

  @prop({ required: true })
  value!: string;

  @prop({ type: Schema.Types.ObjectId })
  entity?: Schema.Types.ObjectId;
}

@plugin(updateTimes)
export class Contact {
  @prop({ required: true })
  name!: string;

  @prop({ type: ContactDetail })
  contactDetails: ContactDetail[] = [];

  @prop()
  remarks?: string;
}

const ContactModel = getModelForClass(Contact, {
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

export default ContactModel;
