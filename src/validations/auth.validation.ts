import { JoiConstants } from "../constants";
import Joi from "joi";

//Auth is not a CRUD route so it won't use the default validation class
const authValidation = {
    register: {
        body: Joi.object().keys({
            username: JoiConstants.USERNAME.required(),
            name: JoiConstants.NAME.required(),
            email: JoiConstants.EMAIL.required(),
            password: JoiConstants.PASSWORD.required(),
            avatar: Joi.string(),
        }),
    },
    login: {
        body: Joi.object().keys({
            email: JoiConstants.EMAIL.required(),
            password: JoiConstants.PASSWORD.required(),
        }),
    },
    logout: {
        body: Joi.object().keys({
            refreshToken: Joi.string().required(),
        }),
    },
    refreshTokens: {
        body: Joi.object().keys({
            refreshToken: Joi.string().required(),
        }),
    },
    sendForgotPassword: {
        body: Joi.object().keys({
            email: JoiConstants.EMAIL.required(),
        }),
    },
    resetPassword: {
        body: Joi.object().keys({
            password: JoiConstants.PASSWORD.required(),
        }),
        query: Joi.object().keys({
            token: Joi.string().required(),
        }),
    },
    verifyEmail: {
        query: Joi.object().keys({
            token: Joi.string().required(),
        }),
    },
};

export default authValidation;
