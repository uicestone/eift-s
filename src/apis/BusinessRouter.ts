import paginatify from "../middleware/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import parseSortString from "../utils/parseSortString";
import HttpError from "../utils/HttpError";
import BusinessModel, { Business } from "../models/Business";
import { isValidHexObjectId } from "../utils/helper";
import { ListQuery } from "./interfaces";
import { Router, Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default (router: Router): Router => {
  // Business CURD
  router
    .route("/business")

    // create a business
    .post(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const business = new BusinessModel(req.body);
        await business.save();
        res.json(business);
      })
    )
    // get all the businesss
    .get(
      paginatify,
      handleAsyncErrors(async (req: Request, res: Response) => {
        const queryParams = req.query as ListQuery;
        const { limit, skip } = req.pagination;
        const query = BusinessModel.find().populate("customer");
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
    .route("/business/:businessId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const business = isValidHexObjectId(req.params.businessId)
            ? await BusinessModel.findById(req.params.businessId)
            : await BusinessModel.findOne({ slug: req.params.businessId });

          if (!business) {
            throw new HttpError(
              404,
              `Business not found: ${req.params.businessId}`
            );
          }

          req.item = business;
          next();
        }
      )
    )

    // get the business with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const business = req.item;
        res.json(business);
      })
    )

    .put(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const business = req.item as DocumentType<Business>;
        business.set(req.body);
        await business.save();
        res.json(business);
      })
    )

    // delete the business with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const business = req.item as DocumentType<Business>;
        await business.remove();
        res.end();
      })
    );

  return router;
};
