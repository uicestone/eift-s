import { prop, plugin, DocumentType } from "@typegoose/typegoose";
import { Business } from "./Business";
import { Capital } from "./Capital";
import { Meeting } from "./Meeting";
import autoPopulate from "./plugins/autoPopulate";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
@plugin(autoPopulate, [{ path: "capital" }, { path: "meetings" }])
export class Investment {
  @prop({ type: String, default: "pending" })
  status: "pending" | "rejected" | "following" | "funded" = "pending";

  @prop({ ref: Capital, required: true })
  capital!: DocumentType<Capital>;

  @prop({ ref: Business, required: true })
  business!: DocumentType<Business>;

  @prop({ type: String, default: "pending" })
  ndaStatus: "pending" | "sent" | "signed" = "pending";

  @prop({ type: String })
  ndaSignedOn!: string;

  @prop({ type: String })
  materialSentOn!: string;

  @prop({
    ref: () => Meeting,
    foreignField: "investment",
    localField: "_id",
  })
  meetings: Meeting[] = [];
}
