import { prop } from "@typegoose/typegoose";
import { Entity } from "./Entity";

class CapitalTeam {
  @prop()
  name!: string;

  @prop()
  contacts!: string;
}

export class Capital extends Entity {
  @prop({ type: String })
  features: string[] = [];

  @prop({ required: true })
  majorLp!: string;

  @prop({ type: CapitalTeam })
  teams: CapitalTeam[] = [];

  @prop({ type: String })
  recentInvestments: string[] = [];
}
