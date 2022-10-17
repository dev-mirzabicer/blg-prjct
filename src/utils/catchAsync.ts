import { Request, Response, NextFunction, RequestHandler } from "express";

export default function catchAsync(func: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err));
    };
}
