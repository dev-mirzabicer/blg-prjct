import jwt from "jsonwebtoken";
import { userServices } from "./";
import ApiError from "../utils/apiError";
import TokenModel from "../models/token.model";
import { TokenType } from "../constants";
import dayjs, { Dayjs } from "dayjs";
import { User } from "../models/user.model";
import { DocumentType } from "@typegoose/typegoose";
import httpStatus from "http-status";

const generateToken = (
    userId: string,
    expires: Dayjs,
    type: string,
    secret: string = process.env.JWT_SECRET ?? ""
) => {
    const payload = {
        sub: userId,
        iat: dayjs().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (
    token: string,
    userId: string,
    expires: Dayjs,
    type: string,
    inactive = false
) => {
    return await TokenModel.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        inactive,
    });
};

const verifyToken = async (token: string, type: string) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "");
    const foundToken = await TokenModel.findOne({
        token,
        type,
        user: payload.sub,
        inactive: false,
    });
    if (!foundToken) {
        throw new Error("Token not found");
    }
    return foundToken;
};

const generateAuthTokens = async (user: DocumentType<User>) => {
    const accessTokenExp = dayjs().add(
        parseInt(process.env.ACCESS_EXP_MIN ?? "5") || 5,
        "minutes"
    );
    const accessToken = generateToken(
        user._id,
        accessTokenExp,
        TokenType.ACCESS
    );

    const refreshTokenExp = dayjs().add(
        parseInt(process.env.REFRESH_EXP_DAY ?? "30") || 30,
        "days"
    );
    const refreshToken = generateToken(
        user._id,
        refreshTokenExp,
        TokenType.REFRESH
    );
    await saveToken(refreshToken, user._id, refreshTokenExp, TokenType.REFRESH);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExp.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExp.toDate(),
        },
    };
};

const generateResetPasswordToken = async (email: string) => {
    const user = await userServices.getOneByEmail(email);
    if (!user)
        throw new ApiError(
            "No users found with this email",
            httpStatus.NOT_FOUND
        );
    const expires = dayjs().add(
        parseInt(process.env.RESET_PASSWORD_EXP_MIN ?? "15") || 15,
        "minutes"
    );
    const resetPasswordToken = generateToken(
        user._id,
        expires,
        TokenType.RESET_PASSWORD
    );
    await saveToken(
        resetPasswordToken,
        user._id,
        expires,
        TokenType.RESET_PASSWORD
    );
    return resetPasswordToken;
};

const generateVerifyEmailToken = async (user: DocumentType<User>) => {
    const expires = dayjs().add(
        parseInt(process.env.VERIFY_EMAIL_EXP_MIN ?? "15") || 15
    );
    const verifyEmailToken = generateToken(
        user._id,
        expires,
        TokenType.VERIFY_EMAIL
    );
    await saveToken(
        verifyEmailToken,
        user._id,
        expires,
        TokenType.VERIFY_EMAIL
    );
    return verifyEmailToken;
};

export default {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken,
    generateVerifyEmailToken,
};
