import paginatify from "../middleware/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import parseSortString from "../utils/parseSortString";
import HttpError from "../utils/HttpError";
import CapitalModel, { Capital } from "../models/Capital";
import { isValidHexObjectId } from "../utils/helper";
import { ListQuery } from "./interfaces";
import { Router, Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default (router: Router): Router => {
  // Capital CURD
  router
    .route("/capital")

    // create a capital
    .post(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const capital = new CapitalModel(req.body);
        await capital.save();
        res.json(capital);
      })
    )
    // get all the capitals
    .get(
      paginatify,
      handleAsyncErrors(async (req: Request, res: Response) => {
        const queryParams = req.query as ListQuery;
        const { limit, skip } = req.pagination;
        const query = CapitalModel.find().populate("customer");
        const sort = parseSortString(queryParams.order) || {
          createdAt: -1,
        };

        let total = await query.countDocuments();
        const page = await query
          .find()
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .exec();

        if (skip + page.length > total) {
          total = skip + page.length;
        }

        res.paginatify(limit, skip, total).json(page);
      })
    );

  router
    .route("/capital/:capitalId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const capital = isValidHexObjectId(req.params.capitalId)
            ? await CapitalModel.findById(req.params.capitalId)
            : await CapitalModel.findOne({ slug: req.params.capitalId });

          if (!capital) {
            throw new HttpError(
              404,
              `Capital not found: ${req.params.capitalId}`
            );
          }

          req.item = capital;
          next();
        }
      )
    )

    // get the capital with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const capital = req.item;
        res.json(capital);
      })
    )

    .put(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const capital = req.item as DocumentType<Capital>;
        capital.set(req.body);
        await capital.save();
        res.json(capital);
      })
    )

    // delete the capital with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const capital = req.item as DocumentType<Capital>;
        await capital.remove();
        res.end();
      })
    );

  return router;
};
