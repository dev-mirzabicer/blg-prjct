/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiError from "../utils/apiError";
import logger from "../utils/logger";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import hs from "http-status";

class Handler {
    error: any;
    message: string;
    constructor(error: any, res: Response) {
        this.error = error;
        this.error.statusCode = error.statusCode || hs.INTERNAL_SERVER_ERROR;
        this.error.status = error.status || "error";
        this.message = error.message;
        this.checkMongooseErrors();
        this.checkMongoError();
        this.checkJWTError();
        this.checkValidationError();
        if (process.env.NODE_ENV === "development") {
            this.sendDev(res);
            return;
        }
        this.sendProd(res);
    }
    checkMongooseErrors() {
        switch (this.error.name) {
            case "ValidationError": {
                this.message = `Invalid input data: ${this.error.message}`;
                this.error = new ApiError(this.message, hs.BAD_REQUEST);
                break;
            }
            case "CastError": {
                this.message = `Invalid format. ${this.error.path}: ${this.error.value} is not a valid format.`;
                this.error = new ApiError(this.message, hs.BAD_REQUEST);
                break;
            }
        }
    }
    checkMongoError() {
        if (this.error.code === 11000) {
            const value = this.error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
            this.message = `Duplicate field value: ${value}`;
            this.error = new ApiError(this.message, hs.BAD_REQUEST);
        }
    }
    checkJWTError() {
        if (this.error.name === "JsonWebTokenError") {
            this.message = "Invalid token.";
            this.error = new ApiError(this.message, hs.UNAUTHORIZED);
        }
        if (this.error.name === "TokenExpiredError") {
            this.message = "Token expired.";
            this.error = new ApiError(this.message, hs.UNAUTHORIZED);
        }
    }
    checkValidationError() {
        if (this.error.name === "ValidationError") {
            this.message = `Invalid input data: ${this.error.message}`;
            this.error = new ApiError(this.message, hs.BAD_REQUEST);
        }
    }
    sendDev(res: Response) {
        res.status(this.error.statusCode).json({
            status: this.error.status,
            message: this.error.message,
            error: this.error,
            stack: this.error.stack,
        });
        return;
    }
    sendProd(res: Response) {
        if (!this.error.isOperational) {
            logger("error", "Internal Error", this.error);
            this.message = "Something went wrong.";
        }
        res.status(this.error.statusCode).json({
            status: this.error.status,
            message: this.message,
        });
        return;
    }
}

const errorMiddleware: ErrorRequestHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return new Handler(error, res);
};

export default errorMiddleware;
