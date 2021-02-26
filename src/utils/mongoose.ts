import mongoose from "mongoose";

import { Db } from "mongodb";
import { TimeStamps, Base } from "@typegoose/typegoose/lib/defaultClasses";

export let mongoClient: Db;

export const initMongoose = async (): Promise<void> => {
  if (!process.env.MONGODB_URL) {
    console.error("Missing MONGODB_URL.");
    process.exit();
  }

  const mongoUrl = process.env.MONGODB_URL;
  try {
    const m = await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    mongoClient = m.connections[0].db;
    console.log(`[MGO] DB: ${mongoUrl} connected.`);
  } catch (err) {
    console.error(`[MGO] DB Connection Error: ${err.message}`);
  }

  mongoose.Promise = global.Promise;
};

export interface TimeStampsBase extends TimeStamps {} // have the interface to add the types of "Base" to the class
export class TimeStampsBase extends Base {} // have your class
