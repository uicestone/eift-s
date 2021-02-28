import { prop, plugin } from "@typegoose/typegoose";
import { Schema } from "mongoose";
import updateTimes from "./plugins/updateTimes";

class ContactDetail {
  @prop({ required: true })
  type!: "fixed" | "mobile" | "email";

  @prop({ required: true })
  scene!: string;

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
  contactDetails: Contact[] = [];

  @prop()
  remarks?: string;
}
