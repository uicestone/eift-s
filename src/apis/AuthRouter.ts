import handleAsyncErrors from "../utils/handleAsyncErrors";
import User from "../models/User";
import HttpError from "../utils/HttpError";
import { signToken, comparePwd } from "../utils/helper";
import {
  AuthLoginPostBody,
  AuthLoginResponseBody,
  AuthTokenUserIdResponseBody,
} from "./interfaces";
import { Router, Request, Response } from "express";

export default (router: Router): Router => {
  router.route("/auth/login").post(
    handleAsyncErrors(async (req: Request, res: Response) => {
      const body = req.body as AuthLoginPostBody;
      if (!body.login) {
        throw new HttpError(400, "请输入用户名");
      }

      if (!body.password) {
        throw new HttpError(400, "请输入密码");
      }

      const user = await User.findOne({ login: body.login }).select([
        "+password",
      ]);

      if (!user) {
        throw new HttpError(404, "用户不存在");
      }
      const validPassword = await comparePwd(
        body.password,
        user.password || ""
      );

      if (!validPassword) {
        throw new HttpError(403, "密码错误");
      }

      user.fingerprint = body.fingerprint;
      const token = signToken(user);

      await user.save();
      user.password = undefined;

      res.json({ token, user } as AuthLoginResponseBody);

      let authLog = `[USR] 用户 ${user.name || user.login} (${
        user._id
      }) 成功登录`;

      ["version", "device-serial", "system", "device-model"].forEach(
        (field) => {
          if (req.get(`x-client-${field}`)) {
            authLog += ` ${req.get(`x-client-${field}`)}`;
          }
        }
      );

      console.log(authLog);
    })
  );

  router.route("/auth/user").get(
    handleAsyncErrors(async (req: Request, res: Response) => {
      const user = await User.findOne({ _id: req.user });
      if (!user) {
        throw new HttpError(401, "用户未登录");
      }
      let authLog = `[USR] 用户 ${user.name || "未知名称"} 获取登录信息`;

      ["version", "device-serial", "system", "device-model"].forEach(
        (field) => {
          if (req.get(`x-client-${field}`)) {
            authLog += ` ${req.get(`x-client-${field}`)}`;
          }
        }
      );

      console.log(authLog);

      res.json(user);
    })
  );

  router.route("/auth/token/:userId").get(
    handleAsyncErrors(async (req: Request, res: Response) => {
      if (req.user.role !== "admin") {
        throw new HttpError(403);
      }
      const user = await User.findOne({ _id: req.params.userId });
      if (!user) {
        throw new HttpError(404, "用户不存在");
      }
      res.json({ token: signToken(user), user } as AuthTokenUserIdResponseBody);
    })
  );

  return router;
};
