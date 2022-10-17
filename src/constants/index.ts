/* eslint-disable no-unused-vars */
import Joi from "joi";

export enum UserRole {
    ADMIN = "admin",
    AUTHOR = "author",
    USER = "user",
}

export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    RESET_PASSWORD = "resetPassword",
    VERIFY_EMAIL = "verifyEmail",
}

export const JoiConstants = {
    USERNAME: Joi.string().min(4).max(20),
    PASSWORD: Joi.string().min(8).alphanum(),
    EMAIL: Joi.string().email(),
    NAME: Joi.string(),
};

export enum TagCat {
    TAG = "tag",
    CAT = "cat",
}
