import { Request, Response, NextFunction } from "express";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const objectKeys = [""];
  const body = req.body as Record<string, any>;
  for (const key in body) {
    if (
      body[key] instanceof Object &&
      objectKeys.includes(key) &&
      body[key].id
    ) {
      body[key] = body[key].id;
    }
    objectKeys.forEach((key) => {
      if (body[key + "Id"]) {
        body.key = body[key + "Id"];
        delete body[key + "Id"];
      }
    });
    if ([""].includes(key) && Array.isArray(body[key])) {
      body[key] = body[key].map((item: any) => item.id || item);
    }
  }
  next();
}
