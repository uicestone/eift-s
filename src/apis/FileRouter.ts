import multer, { diskStorage } from "multer";
import { createHash } from "crypto";
import { renameSync } from "fs";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import File, { File as IFile } from "../models/File";
import HttpError from "../utils/HttpError";
import { DocumentType } from "@typegoose/typegoose";
import { Router, Request, Response, NextFunction, Express } from "express";

interface HashedFile extends Express.Multer.File {
  hashedFullName: string;
}

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/uploads/");
  },
  filename: function (req: Request, file: HashedFile, cb) {
    const hash = createHash("sha1");
    const match = file.originalname.match(/^.*(\..*?)$/);
    const extension = match ? match[1] : "";
    file.stream.on("data", (data) => {
      hash.update(data);
    });
    file.stream.on("end", () => {
      const hex = hash.digest("hex");
      file.hashedFullName = hex + extension;
    });
    cb(null, `tmp-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export default (router: Router): Router => {
  // File CURD
  router
    .route("/file")

    // create a file
    .post(
      upload.single("file"),
      handleAsyncErrors(async (req: Request, res: Response) => {
        const reqFile = req.file as HashedFile;
        renameSync(reqFile.path, reqFile.destination + reqFile.hashedFullName);
        const fileUriPrefix = "uploads/" + reqFile.hashedFullName;
        const file = new File() as DocumentType<IFile>;
        file.name = reqFile.originalname;
        file.uri = fileUriPrefix;
        await file.save();
        res.json(file);
      })
    );

  router
    .route("/file/:fileId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const file = await File.findById(req.params.fileId);
          if (!file) {
            throw new HttpError(404, `找不到文件：${req.params.fileId}`);
          }
          req.item = file;
          next();
        }
      )
    )

    // get the file with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const file = req.item;
        res.json(file);
      })
    )

    // delete the file with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const file = req.item as DocumentType<IFile>;
        await file.remove();
        // TODO unlink file
        res.end();
      })
    );

  return router;
};
