import paginatify from "../middleware/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import parseSortString from "../utils/parseSortString";
import HttpError from "../utils/HttpError";
import ContactModel, { Contact } from "../models/Contact";
import { isValidHexObjectId } from "../utils/helper";
import { ListQuery } from "./interfaces";
import { Router, Request, Response, NextFunction } from "express";
import { DocumentType } from "@typegoose/typegoose";

export default (router: Router): Router => {
  // Contact CURD
  router
    .route("/contact")

    // create a contact
    .post(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const contact = new ContactModel(req.body);
        await contact.save();
        res.json(contact);
      })
    )
    // get all the contacts
    .get(
      paginatify,
      handleAsyncErrors(async (req: Request, res: Response) => {
        const queryParams = req.query as ListQuery;
        const { limit, skip } = req.pagination;
        const query = ContactModel.find().populate("customer");
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
    .route("/contact/:contactId")

    .all(
      handleAsyncErrors(
        async (req: Request, res: Response, next: NextFunction) => {
          const contact = isValidHexObjectId(req.params.contactId)
            ? await ContactModel.findById(req.params.contactId)
            : await ContactModel.findOne({ slug: req.params.contactId });

          if (!contact) {
            throw new HttpError(
              404,
              `Contact not found: ${req.params.contactId}`
            );
          }

          req.item = contact;
          next();
        }
      )
    )

    // get the contact with that id
    .get(
      handleAsyncErrors(async (req: Request, res: Response) => {
        const contact = req.item;
        res.json(contact);
      })
    )

    .put(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const contact = req.item as DocumentType<Contact>;
        contact.set(req.body);
        await contact.save();
        res.json(contact);
      })
    )

    // delete the contact with this id
    .delete(
      handleAsyncErrors(async (req: Request, res: Response) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const contact = req.item as DocumentType<Contact>;
        await contact.remove();
        res.end();
      })
    );

  return router;
};
