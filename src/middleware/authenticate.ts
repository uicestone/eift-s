import HttpError from "../utils/HttpError";
import { getTokenData, TokenData } from "../utils/helper";
import { Types } from "mongoose";
import User, { User as IUser } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.get("authorization") || (req.query.token as string);

  if (token) {
    try {
      req.user = await getUserFromToken(token);
    } catch (err) {
      return next(err);
    }
  } else if ([].some((pattern) => req.path.match(`^/api/${pattern}$`))) {
    return next(new HttpError(401, "登录后才能访问此功能"));
  } else {
    req.user = new User({ _id: Types.ObjectId(), role: "guest" });
  }

  next();
}

async function getUserFromToken(token: string): Promise<DocumentType<IUser>> {
  const { DEBUG } = process.env;
  if (DEBUG) {
    const debugUser = await User.findOne({
      login: token.replace(/^Bearer /, ""),
    }).select("+fingerprint");
    if (debugUser) return debugUser;
  }
  let tokenData: TokenData;
  try {
    tokenData = getTokenData(token);
  } catch (e) {
    throw new HttpError(401, "无效令牌，请重新登录");
  }
  const user = await User.findById(tokenData.userId).select("+fingerprint");
  if (!user) {
    throw new HttpError(401, "无效令牌，请重新登录");
  }
  if (user.fingerprint !== tokenData.fingerprint) {
    console.log(
      `[USR] Fingerprint mismatch, should be ${user.fingerprint}, got ${tokenData.fingerprint}.`
    );
    throw new HttpError(401, "账号已在别处登录，请重新登录");
  }
  delete user?.fingerprint;
  return user;
}
