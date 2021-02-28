import { prop, plugin, DocumentType } from "@typegoose/typegoose";
import { Contact } from "./Contact";
import autoPopulate from "./plugins/autoPopulate";
import updateTimes from "./plugins/updateTimes";

class Address {
  @prop({ required: true })
  province!: string;

  @prop({ required: true })
  city!: string;

  @prop({ required: true })
  county!: string;

  @prop({ required: true })
  town!: string;

  @prop({ required: true })
  detail!: string;

  @prop({ required: true })
  alias!: string;
}

@plugin(updateTimes)
@plugin(autoPopulate, [{ path: "contacts" }])
export class Entity {
  @prop({ required: true })
  name!: string;

  @prop({
    ref: () => Contact,
    foreignField: "entity",
    localField: "_id",
  })
  contacts: DocumentType<Contact>[] = [];

  @prop({ type: Address })
  addresses: Address[] = [];

  @prop()
  remarks?: string;
}
