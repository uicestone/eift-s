import { Request, Response, NextFunction } from "express";
import { parse } from "express-useragent";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.headers["user-agent"])
      throw new Error("Empty user-agent in headers.");
    const ua = parse(req.headers["user-agent"]);
    const source = ua.source;
    req.ua = { ...ua, isWechat: !!source.match(/ MicroMessenger\//) };
  } catch (e) {
    console.error(e.message);
    req.ua = {};
  }
  next();
}
