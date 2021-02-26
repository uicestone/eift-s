import Agenda from "agenda";
import { MongoClient } from "mongodb";
import { hashPwd } from "./helper";
import User from "../models/User";

let agenda: Agenda = new Agenda();

export const initAgenda = async (): Promise<void> => {
  const client = new MongoClient(process.env.MONGODB_URL || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();

  agenda = new Agenda({ mongo: client.db() });

  agenda.define("reset admin password", async (job, done) => {
    console.log(`[CRO] Reset admin password...`);
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      admin.password = await hashPwd("1234");
      await admin.save();
    }
    console.log(`[CRO] Finished reset admin password.`);
    done();
  });

  agenda.start();

  agenda.on("ready", () => {
    // agenda.now("reset admin password");
  });

  agenda.on("error", (err) => {
    console.error(err.message);
  });
};

export default agenda;
