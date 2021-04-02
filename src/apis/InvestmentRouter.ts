import paginatify from "../middleware/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import parseSortString from "../utils/parseSortString";
import HttpError from "../utils/HttpError";
import InvestmentModel, { Investment } from "../models/Investment";
import { isValidHexObjectId } from "../utils/helper";
import { ListQuery } from "./interfaces";
import { Router, Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default (router: Router): Router => {
  // Investment CURD
  router
    .route("/investment")

    // create a investment
    .post(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const investment = new InvestmentModel(req.body);
        await investment.save();
        res.json(investment);
      })
    )
    // get all the investments
    .get(
      paginatify,
      handleAsyncErrors(async (req: Request, res: Response) => {
        const queryParams = req.query as ListQuery;
        const { limit, skip } = req.pagination;
        const query = InvestmentModel.find().populate("customer");
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
    .route("/investment/:investmentId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const investment = isValidHexObjectId(req.params.investmentId)
            ? await InvestmentModel.findById(req.params.investmentId)
            : await InvestmentModel.findOne({ slug: req.params.investmentId });

          if (!investment) {
            throw new HttpError(
              404,
              `Investment not found: ${req.params.investmentId}`
            );
          }

          req.item = investment;
          next();
        }
      )
    )

    // get the investment with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const investment = req.item;
        res.json(investment);
      })
    )

    .put(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const investment = req.item as DocumentType<Investment>;
        investment.set(req.body);
        await investment.save();
        res.json(investment);
      })
    )

    // delete the investment with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const investment = req.item as DocumentType<Investment>;
        await investment.remove();
        res.end();
      })
    );

  return router;
};
