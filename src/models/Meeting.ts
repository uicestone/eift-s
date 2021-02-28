import { prop, plugin, Ref, DocumentType } from "@typegoose/typegoose";
import { Investment } from "./Investment";
import autoPopulate from "./plugins/autoPopulate";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
@plugin(autoPopulate, [{ path: "files" }])
export class Meeting {
  @prop({ ref: Investment })
  investment!: Ref<Investment>;

  @prop({ required: true })
  date!: string;

  @prop({ ref: File })
  files: DocumentType<File>[] = [];

  @prop()
  remarks?: string;
}
