import { sign, verify } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import { User } from "../models/User";
import { DocumentType } from "@typegoose/typegoose";
import { getExtension } from "mime";
import { writeFileSync } from "fs";
import { createHash } from "crypto";

export interface TokenData {
  userId: number;
  userRole: string;
  fingerprint?: string;
}
const { APP_SECRET = "test123456" } = process.env;

export const hashPwd = (password: string): Promise<string> =>
  hash(password, 10);

export const comparePwd = (
  password: string,
  hashPassword: string
): Promise<boolean> => compare(password, hashPassword);

export const signToken = (user: DocumentType<User>): string => {
  return sign(
    {
      userId: user.id,
      userRole: user.role,
      fingerprint: user.fingerprint,
    },
    APP_SECRET
  );
};
export const verifyToken = (token: string): TokenData =>
  verify(token, APP_SECRET) as TokenData;

export const getTokenData = (token: string): TokenData => {
  token = token.replace(/^Bearer /, "");
  return verifyToken(token);
};

export const sleep = async (milliseconds = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const isValidHexObjectId = (id: string): boolean => {
  return !!id.match(/^[0-9a-fA-F]{24}$/);
};

export const saveContentImages = (content: string): string => {
  if (!content.match(";base64,")) {
    return content;
  }
  const srcs = content.match(/src="data:image(.*?)"/g);
  if (!srcs) return "";
  srcs.map((src) => {
    const match = src.match(/^src="data:(.*?);base64,(.*?)"$/);
    if (!match) return;
    const [, mime, base64] = match;
    console.log(`[HLP] Found base64 of ${mime}.`);
    const ext = getExtension(mime);
    const data = Buffer.from(base64, "base64");
    const filename = createHash("sha1").update(data).digest("hex") + "." + ext;
    const path = process.cwd() + "/uploads/" + filename;
    writeFileSync(path, data);
    console.log(`[HLP] Base64 saved to file ${filename}.`);
    content = content.replace(
      src,
      `src="${process.env.UPLOAD_BASE}uploads/${filename}"`
    );
  });
  return content;
};
