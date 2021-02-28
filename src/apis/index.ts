import cors from "cors";
import authenticate from "../middleware/authenticate";
import castEmbedded from "../middleware/castEmbedded";
import AuthRouter from "./AuthRouter";
import CapitalRouter from "./CapitalRouter";
import ConfigRouter from "./ConfigRouter";
import FileRouter from "./FileRouter";
import UserRouter from "./UserRouter";
import detectUa from "../middleware/detectUa";
import { Express, Router, Response, Request } from "express";

export default (app: Express, router: Router): void => {
  // register routes
  [AuthRouter, CapitalRouter, ConfigRouter, FileRouter, UserRouter].forEach(
    (R) => {
      router = R(router);
    }
  );

  router.get("/", (req: Request, res: Response) => {
    res.send("Welcome!");
  });

  app.use(
    "/api",
    cors({
      exposedHeaders: [
        "content-range",
        "accept-range",
        "items-total",
        "items-start",
        "items-end",
      ],
    }),
    authenticate,
    castEmbedded,
    detectUa,
    router
  );
};
