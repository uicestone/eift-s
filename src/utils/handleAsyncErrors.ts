import { Request, Response, NextFunction } from "express";

const handleAsyncErrors = (
  fn: (req: Request, res: Response, next: NextFunction) => void
) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default handleAsyncErrors;
