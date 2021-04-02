import { prop, plugin, DocumentType } from "@typegoose/typegoose";
import { Contact } from "./Contact";
import { File } from "./File";
import autoPopulate from "./plugins/autoPopulate";
import updateTimes from "./plugins/updateTimes";

class Address {
  @prop()
  province?: string;

  @prop()
  city?: string;

  @prop()
  county?: string;

  @prop()
  town?: string;

  @prop()
  detail?: string;

  @prop()
  alias?: string;
}

@plugin(updateTimes)
@plugin(autoPopulate, [{ path: "contacts" }, { path: "files" }])
export class Entity {
  @prop({ required: true })
  name!: string;

  @prop()
  abbr?: string;

  @prop({
    ref: () => Contact,
    foreignField: "entity",
    localField: "_id",
  })
  contacts: DocumentType<Contact>[] = [];

  @prop({ type: Address })
  addresses: Address[] = [];

  @prop({ ref: File })
  files: DocumentType<File>[] = [];

  @prop()
  remarks?: string;
}
