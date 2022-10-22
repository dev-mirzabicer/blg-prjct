/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-types */
import { UserRole } from "../constants";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { DocumentType } from "@typegoose/typegoose";
import { User } from "../models/user.model";
import ApiError from "../utils/apiError";

const verification =
    (
        req: Request,
        resolve: Function,
        reject: Function,
        requiredRoles: UserRole[] = []
    ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (err: Error, user: DocumentType<User>, info: any) => {
        if (err || info || !user) {
            return reject(new ApiError("Unauthorized", 401));
        }
        req.user = user;

        if (requiredRoles.length && !requiredRoles.includes(user.role)) {
            return reject(
                new ApiError("You're not permitted to access this route", 403)
            );
        }
        resolve();
    };

const auth =
    (...requiredRoles: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        return new Promise((resolve, reject) => {
            passport
                .authenticate(
                    "jwt",
                    { session: false },
                    verification(req, resolve, reject, requiredRoles)
                )(req, res, next)
                .then(() => next())
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((err: any) => next(err));
        });
    };

export default auth;
