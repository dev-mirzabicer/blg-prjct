/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";
import ApiError from "../utils/apiError";
import pick from "../utils/pick";
import hs from "http-status";

const validate = (
    schema: Record<string, Joi.ObjectSchema<any> | Joi.Schema<any>>
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const options = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };

        const validSchema = pick(schema, ["params", "query", "body"]);

        //pqb = params/query/body
        const pqb = pick(req, Object.keys(validSchema));

        const { value, error } = Joi.compile(validSchema).validate(
            pqb,
            options
        );

        if (error) {
            const message = error.details
                .map((details) => details.message)
                .join(",\n");
            return next(new ApiError(message, hs.BAD_REQUEST));
        }

        Object.assign(req, value);
        return next();
    };
};

export default validate;
