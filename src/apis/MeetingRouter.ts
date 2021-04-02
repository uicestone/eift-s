import paginatify from "../middleware/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import parseSortString from "../utils/parseSortString";
import HttpError from "../utils/HttpError";
import MeetingModel, { Meeting } from "../models/Meeting";
import { isValidHexObjectId } from "../utils/helper";
import { ListQuery } from "./interfaces";
import { Router, Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default (router: Router): Router => {
  // Meeting CURD
  router
    .route("/meeting")

    // create a meeting
    .post(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const meeting = new MeetingModel(req.body);
        await meeting.save();
        res.json(meeting);
      })
    )
    // get all the meetings
    .get(
      paginatify,
      handleAsyncErrors(async (req: Request, res: Response) => {
        const queryParams = req.query as ListQuery;
        const { limit, skip } = req.pagination;
        const query = MeetingModel.find().populate("customer");
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
    .route("/meeting/:meetingId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const meeting = isValidHexObjectId(req.params.meetingId)
            ? await MeetingModel.findById(req.params.meetingId)
            : await MeetingModel.findOne({ slug: req.params.meetingId });

          if (!meeting) {
            throw new HttpError(
              404,
              `Meeting not found: ${req.params.meetingId}`
            );
          }

          req.item = meeting;
          next();
        }
      )
    )

    // get the meeting with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const meeting = req.item;
        res.json(meeting);
      })
    )

    .put(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const meeting = req.item as DocumentType<Meeting>;
        meeting.set(req.body);
        await meeting.save();
        res.json(meeting);
      })
    )

    // delete the meeting with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const meeting = req.item as DocumentType<Meeting>;
        await meeting.remove();
        res.end();
      })
    );

  return router;
};
